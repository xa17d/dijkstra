'use strict';

angular.module('dijkstraApp')

.provider('colors', function () {

    this.faded = {
        stroke: "#000000",
        background: "#000000",
        edge: "#000000"
    };

    this.selected = {
        stroke: "#000000",
        background: "#000000",
        edge: "#000000"
    };

    this.visible = {
        stroke: "#000000",
        background: "#000000",
        edge: "#000000"
    };

    this.emphasized = {
        stroke: "#000000",
        background: "#000000",
        edge: "#000000"
    };

    this.highlighted = {
        stroke: "#000000",
        background: "#000000",
        edge: "#000000"
    };

    this.$get = function () {
        return this;
    };
});