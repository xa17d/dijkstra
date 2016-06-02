'use strict';

angular.module('dijkstraApp')

.provider('colors', function () {

    this.faded = {
        stroke: "#cccccc",
        background: "#dddddd",
        edge: "#cccccc"
    };

    this.selected = {
        stroke: "#ffff00",
        background: "#eeee00",
        edge: "#000000"
    };

    this.visible = {
        stroke: "#333333",
        background: "#555555",
        edge: "#333333"
    };

    this.emphasized = {
        stroke: "#0000ff",
        background: "#0000ee",
        edge: "#0000ee"
    };

    this.highlighted = {
        stroke: "#00ff00",
        background: "#00ee00",
        edge: "#00ff00"
    };

    this.$get = function () {
        return this;
    };
});