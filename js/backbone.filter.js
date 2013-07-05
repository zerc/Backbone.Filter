/**
 * Backbone Filter v0.0.2
 *
 * Copyright (c) 2013 zero13cool http://zerc.ru
 *
 */

(function (Backbone, $, _) {
    // shortcat for simple filtering
    var Filter = function (options) {
        var control_view = Filter[options.single_select ? 
            'SingleControlView' : 'MultipleSelectControlView'
        ];

        return {
            collection_view: new Filter.CollectionView({
                el           : options.collection_el,
                itemView     : options.itemView,
                collection   : options.collection
            }),

            control_view: new control_view({
                el          : options.control_el,
                match_any  : options.match_any,
                collection  : options.collection 
            })
        }
    }
    
    // View for control elements
    Filter.MultipleSelectControlView = Backbone.View.extend({
        filter_params: {},

        active_class: 'active',

        initialize: function (opts) {
            this.match_func = _[opts.match_any ? 'any' : 'all'];
        },

        events: {
            'click a': 'select'
        },

        add: function (fname, value) {
            if (this.filter_params[fname])
                this.filter_params[fname].push(value)
            else
                this.filter_params[fname] = [value];
        },

        remove: function (fname, value) {
            this.filter_params[fname] = _.reject(this.filter_params[fname], function (p) {
                return p === value
            });

            if (!this.filter_params[fname].length)
                delete this.filter_params[fname];
        },

        set_active: function (el) {
            el.addClass(this.active_class);
        },

        remove_active: function (el) {
            el.removeClass(this.active_class);
        },

        is_active: function (el) {
            return el.hasClass(this.active_class)
        },

        _deselect: function (fname, value) {
            this.remove(fname, value);

            if (_.isEmpty(this.filter_params))
                delete this.collection.ff;
        },

        _select: function (fname, value) {
            var self = this;

            this.add(fname, value);

            if (!this.collection.ff) {
                this.collection.ff = function () {
                    return self.match_func(self.filter_params, function (v, k) {
                        return _.indexOf(v, this.get(k)) >= 0;
                    }, this);
                }
            }

        },

        select: function (e) {
            var self = this,
                $el = $(e.target),
                params = $el.attr('data-filter').split(':');
            
            if (this.is_active($el)) {
                this.remove_active($el);
                this._deselect(params[0], params[1]);
            } else {
                this.set_active($el)
                this._select(params[0], params[1]);
            }

            this.collection.trigger('filtered');
            return false;
        }
    });
    
    
    Filter.SingleControlView = Filter.MultipleSelectControlView.extend({
        select: function (e) {
            var $el = $(e.target);

            if (!this.is_active($el)) {
                this.filter_params = {}
                this.remove_active(this.$el.find('a'));
            }

            return Filter.MultipleSelectControlView.prototype.select.call(this, e);
        }
    });

    // View for rendering items
    Filter.CollectionView = Backbone.View.extend({
        initialize: function (opts) {
            this.itemView = opts.itemView;
            this.collection.on('filtered', this.render, this);
            this.render();
        },

        render: function () {
            this.$el.html('');
            this.collection.each(function (model) {
                if (!this.collection.ff || this.collection.ff.call(model)) {
                    this.$el.append(new this.itemView({model:model}).render().el);
                }
            }, this);
            return this;
        }
    });

    // EXPORT
    Backbone.Filter = Filter;
}(Backbone, $, _));
