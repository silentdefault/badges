self.addEventListener('message', function(e) {
    const input = e.data;

    switch (input.cmd) {
        case 'init':
            init();
            break;
        case 'process':
            process(input);
            break;
        default:
            console.log('Unknown command for QRCode worker.');
            break;
    }
});

function init() {
    self.importScripts(
        'lib/grid.js',
        'lib/version.js',
        'lib/detector.js',
        'lib/formatinf.js',
        'lib/errorlevel.js',
        'lib/bitmat.js',
        'lib/datablock.js',
        'lib/bmparser.js',
        'lib/datamask.js',
        'lib/rsdecoder.js',
        'lib/gf256poly.js',
        'lib/gf256.js',
        'lib/decoder.js',
        'lib/qrcode.js',
        'lib/findpat.js',
        'lib/alignpat.js',
        'lib/databr.js'
    );
}

function process(input) {
    qrcode.width = input.width;
    qrcode.height = input.height;
    qrcode.imagedata = input.imageData;

    let result = false;
    try {
        result = qrcode.process();
    } catch (e) {}

    postMessage(result);
}