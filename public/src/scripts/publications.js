'use strict';

var Clipboard = require('clipboard/dist/clipboard.min');

$(document).ready(function () {
    var bibtexBtn = $('.bibtex-copy');

    bibtexBtn.tooltip({
        trigger: 'click'
    });

    // Initialize clipboard.js instance on every BibTeX copy-button
    var bibtexClipboard = new Clipboard('.bibtex-copy');

    // Show 'copied' tooltip on click
    function setBibTeXTooltip(target, message) {
        target.attr('data-original-title', message)
            .tooltip('show');
    }

    function hideBibTeXTooltip(target) {
        setTimeout(function () {
            target.tooltip('hide');
        }, 1500);
    }

    bibtexClipboard.on('success', function (e) {
        setBibTeXTooltip($(e.trigger), 'BibTeX copied to clipboard!');
        hideBibTeXTooltip($(e.trigger));
    });

    bibtexClipboard.on('error', function (e) {
        setBibTeXTooltip($(e.trigger), 'BibTeX copy failed');
        hideBibTeXTooltip($(e.trigger));
    });
});
