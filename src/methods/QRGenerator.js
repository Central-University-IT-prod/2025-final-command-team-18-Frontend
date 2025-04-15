import QRCode from 'qrcode';

export function qr_to_canvas(document, data, version){
    QRCode.toCanvas(document, data, { version: version }, function (error) {
        if (error) console.error(error)
    });
}