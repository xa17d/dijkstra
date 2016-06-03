'use strict';

angular.module('dijkstraApp')

.provider('colors', function () {

    var black = '#000000';
    var darkgrey = '#616161'        // or #424242
    var mediumgrey = '#757575';
    var lightgrey = '#BDBDBD'       // or #9E9E9E
    var white = '#FFFFFF';

    var primary = '#4CAF50';
    var accent = '#FF9800';


    this.faded = {
        stroke: darkgrey,
        background: lightgrey,
        edge: darkgrey
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