'use strict';

angular.module('dijkstraApp')

.provider('colors', function () {

    var black = '#000000';
    var darkgrey = '#616161';
    var mediumgrey = '#757575';
    var lightgrey = '#BDBDBD';
    var background = '#F5F5F5';
    var white = '#FFFFFF';

    var primary = '#4CAF50';
    var accent = '#FF9800';


    this.faded = {
        stroke: lightgrey,
        background: background,
        edge: lightgrey
    };

    this.selected = {
        stroke: black,
        background: accent,
        edge: accent
    };

    this.visible = {
        stroke: black,
        background: lightgrey,
        edge: black
    };

    this.emphasized = {
        stroke: primary,
        background: lightgrey,
        edge: primary
    };

    this.highlighted = {
        stroke: primary,
        background: accent,
        edge: accent
    };

    this.$get = function () {
        return this;
    };
});