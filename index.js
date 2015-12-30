const QuoteMatic = require('./lib/quotematic');

new QuoteMatic()
    .size('900')
    .background('transparent')
    .font('media/orange.ttf')
    .fill('#624754')
    .fontSize(120)
    .text('Acerrimus ex omnibus nostris sensibus est sensus videndi')
    .buffer('png')
    .then(buffer => {
        new QuoteMatic(buffer)
            .geometry('+200+200')
            .composite('media/background.jpg')
            .resize('90%')
            .write('media/funciona.png');
    })
    .catch((err) => {
        throw new Error(err);
    });