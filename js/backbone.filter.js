/**
 * Backbone Filter v0.0.1
 *
 * Copyright (c) 2013 zero13cool http://zerc.ru
 *
 */

(function (Backbone, $, _) {
    // shortcat for simple filtering
    var Filter = function (options) {
        return {
            collection_view: new Filter.CollectionView({
                el           : options.collection_el,
                itemView     : options.itemView,
                collection   : options.collection
            }),

            control_view: new Filter.ControlView({
                el          : options.control_el,
                collection  : options.collection 
            })
        }
    }

    // View for control elements
    Filter.ControlView = Backbone.View.extend({
        active_class: 'active',

        initialize: function (el) {
            this.el = el;
        },

        events: {
            'click a': 'select'
        },

        _is_active: function (el) {
            return el.hasClass(this.active_class);
        },

        _disable: function (el) {
            el.removeClass(this.active_class);
        },

        _activate: function (el) {
            el.addClass(this.active_class);  
        },

        _get_controls: function () {
            return this.$el.find('a');
        },

        select: function (e) {
            var $el = $(e.target),
                params = $el.attr('data-filter').split(':');

            if (params[0] === 'reset' || this._is_active($el)) {
                this._disable(this._get_controls());
                delete this.collection.ff;
            } else {
                this.collection.ff = function () {
                    var v = typeof this.get(params[0]) === 'number' ? parseInt(params[1]) : params[1];
                    return (this.get(params[0]) === v);
                }

                this._disable(this._get_controls());
                this._activate($el);                
            }

            this.collection.trigger('filtered');

            return false;
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
