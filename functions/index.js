const functions = require('firebase-functions');
const admin = require("firebase-admin")
const nodemailer = require('nodemailer');
const mailEmail = functions.config().mail.email;
const mailPassword = functions.config().mail.password;

admin.initializeApp()

//google account credentials used to send email
var transporter = nodemailer.createTransport({
  host: 'smtp.yandex.ru',
  port: 465,
  secure: true,
  auth: {
    user: mailEmail,
    pass: mailPassword
  }
});

const Offer = {
  material: 'Материалов',
  gasoline: 'Дизельного топлива'
}

const TransportMap = {
  'auto-containers': 'Контейнеровоза',
  'auto-towers': 'Автовышки',
  'bulldozers': 'Бульдозера',
  'chambos': 'Илососа',
  'crawler-excavators': 'Гусеничного экскаватора',
  'front-loaders': 'Фронтального погрузчика',
  'gasoline-tankers': 'Бензовоза',
  'low-loaders': 'Низкорамный трала',
  'power-stations': 'Электростанции',
  'timber-tracks': 'Сортиментовоза',
  'tippers': 'Самосвала',
  'tractors': 'Трактора'
}

const renderPersonalData = function(data) {
  return `
    <h3>Данные клиента:</h3>
   <table border="0" cellpadding="0" cellspacing="0" width="250">
    <tr>
      <td>Имя:</td>
      <td><b>${data.personal.userName || data.personal.companyPerson || 'не заполнено'}</b></td>
   </tr>
   ${data.personal.companyName ? (() => `<tr><td>Название компании:</td><td><b>${data.personal.companyName || 'не заполнено'}</b></td></tr>`)() : ''}
  <tr>
    <td>Email: </td>
    <td><b>${data.personal.email || 'не заполнено'}</b></td>
  </tr>
  <tr>
    <td>Телефон: </td>
    <td><b>${data.personal.tel ? JSON.stringify(data.personal.tel) : 'не заполнено'}</b></td>
  </tr>
 </table>
  <h3>Сообщение:</h3>
 <p>${data.message ? data.message : 'не заполнено'}</p>
  `
};

const renderWorkData = function(data) {
  return `
   <h3>Данные по работе:</h3>
   <table border="0" cellpadding="0" cellspacing="0" width="500">
   <tr>
      <td>Тип работы:</td>
      <td><b>${data.variant ? data.variant : 'не заполнено'}</b></td>
    </tr>
    <tr>
      <td>Место проведения работы:</td>
      <td><b>${data.work.place || 'не заполнено'}</b></td>
    </tr>
    <tr>
      <td>Время проведения работы: </td>
      <td><b>${data.work.time || 'не заполнено'}</b></td>
    </tr>
   </table>
  `
}

const renderDeliveryData = function(data) {
  return `
   <h3>Данные по доставке:</h3>
   <table border="0" cellpadding="0" cellspacing="0" width="500">
   <tr>
      <td>Тип груза:</td>
      <td><b>${data.variant ? data.variant : 'не заполнено'}</b></td>
    </tr>
    <tr>
      <td>Доставка нужна в:</td>
      <td><b>${data.work.place || 'не заполнено'}</b></td>
    </tr>
    <tr>
      <td>Доставка нужна на дату:</td>
      <td><b>${data.work.time || 'не заполнено'}</b></td>
    </tr>
   </table>
  `
}

const renderRentalData = function(data) {
  return `
   <h3>Данные по аренде:</h3>
   <table border="0" cellpadding="0" cellspacing="0" width="500">
   <tr>
      <td>Обьект аренды:</td>
      <td><b>${data.variant || 'не заполнено'}</b></td>
    </tr>
   </table>
  `
}

const renderTransportData = function(data) {
  return `
   <h3>Данные по аренде:</h3>
   <table border="0" cellpadding="0" cellspacing="0" width="300">
     <tr>
      <td>Дата предоставления:</td>
      <td><b>${data.rent.date || 'не заполнено'}</b></td>
    </tr>
    <tr>
      <td>Место доставки:</td>
      <td><b>${data.rent.location || 'не заполнено'}</b></td>
    </tr>
     <tr>
      <td>Период аренды:</td>
      <td><b>${data.rent.period || 'не заполнено'}</b></td>
    </tr>
   </table>
  `
}

const renderSaleData = function(data) {
  return `
   <table border="0" cellpadding="0" cellspacing="0" width="230">
   <tr>
      <td>Материал:</td>
      <td><b>${data.material || 'не заполнено'}</b></td>
      ${data.gasolineCount ? (() => `<tr><td>Количество (литров):</td><td><b>${data.gasolineCount || 'не заполнено'}</b></td></tr>`)() : ''}
      ${data.materialsCount ? (() => `<tr><td>Количество (тонн):</td><td><b>${data.materialsCount || 'не заполнено'}</b></td></tr>`)() : ''}
    <tr>
      <td>Дата:</td>
      <td><b>${data.delivery.date || 'не заполнено'}</b></td>
    </tr>
    <tr>
      <td>Адрес:</td>
      <td><b>${data.delivery.location || 'не заполнено'}</b></td>
    </tr>
    </tr>
   </table>
  `
}

exports.sendEmail = functions
  .region('asia-northeast1')
  .firestore
  .document('services-email/{emailId}')
  .onCreate((snap, context) => {

    const data = snap.data();

    const mailOptions = {
      from: `${mailEmail}`,
      to: `${mailEmail}`,
      subject: `Заявка на услугу '${data.serviceTitle.split('&').join(' ') || data.serviceTitle}'`,
      html: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
          <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
 	           <title></title>
 	           <style type="text/css"></style>
            </head>
            <body>
           	  <!-- Email content goes here -->
              ${(data.id.indexOf('cargo') !== -1 ? renderDeliveryData(data) : data.id.indexOf('work') !== -1 ? renderWorkData(data) : renderRentalData(data))}
              ${renderPersonalData(data)}
            </body>
          </html>
        `
    };

    return transporter.sendMail(mailOptions, (error, data) => {
      if (error) {
        return error;
      }
      console.log("Sent!")
      return data;
    });
  });


exports.sendTransportEmail = functions
  .region('asia-northeast1')
  .firestore
  .document('transport-email/{emailId}')
  .onCreate((snap, context) => {

    const data = snap.data();

    const mailOptions = {
      from: `${mailEmail}`,
      to: `${mailEmail}`,
      subject: `Заявка на аренду ${TransportMap[data.transport]}`,
      html: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
          <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
 	           <title></title>
 	           <style type="text/css"></style>
            </head>
            <body>
           	  <!-- Email content goes here -->
              ${renderTransportData(data)}
              ${renderPersonalData(data)}
            </body>
          </html>
        `
    };

    return transporter.sendMail(mailOptions, (error, data) => {
      if (error) {
        return error;
      }
      console.log("Sent!")
      return data;
    });
  });

exports.sendMaterialsEmail = functions
  .region('asia-northeast1')
  .firestore
  .document('materials-email/{emailId}')
  .onCreate((snap, context) => {

    const data = snap.data();

    const mailOptions = {
      from: `${mailEmail}`,
      to: `${mailEmail}`,
      subject: `Заявка на покупку ${Offer[data.offer]}`,
      html: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
          <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
 	           <title></title>
 	           <style type="text/css"></style>
            </head>
            <body>
           	  <!-- Email content goes here -->
           	  ${renderSaleData(data)}
              ${renderPersonalData(data)}
            </body>
          </html>
        `
    };

    return transporter.sendMail(mailOptions, (error, data) => {
      if (error) {
        return error;
      }
      console.log("Sent!")
      return data;
    });
  });
