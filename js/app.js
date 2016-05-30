angular.module('dijkstraApp', ['ngMaterial', 'ngAnimate', 'ui.bootstrap'])

    .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('green')
            .accentPalette('amber');
    });