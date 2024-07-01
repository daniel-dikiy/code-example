window.jsPDF = window.jspdf.jsPDF;

$(document).ready(function () {
  $("#model").focus();

  $("#calculate").on("click", function () {
    calculate();
    sendMessageToParent();
  });

  $("body").on("keypress", function (e) {
    if (e.which == 13) {
      calculate();
      sendMessageToParent();
    }
  });

  sendMessageToParent();
});

$(".inputcalc").keypress(function (event) {
  const theEvent = event || window.event;
  let key = theEvent.keyCode || theEvent.which;
  key = String.fromCharCode(key);
  const regex = /[0-9]/;
  if (!regex.test(key)) {
    theEvent.returnValue = false;
    if (theEvent.preventDefault) theEvent.preventDefault();
  }
});

$("#model").keyup(function () {
  resetResult();
});

$(".inputcalc").keyup(function (event) {
  const id = $(event.currentTarget).attr("id");
  $(`#${id}`).val(numberWithDots($(`#${id}`).val().replace(/\./g, "")));
  if ($(`#${id}`).hasClass("is-invalid")) $(`#${id}`).removeClass("is-invalid");
  resetResult();
});

const sendMessageToParent = () => {
  const message = { height: document.body.scrollHeight };
  window.top.postMessage(message, "*");
};

const calculate = () => {
  const regex = /[0-9]/;
  const model = $("#model").val() || "";
  const lengthDotted = $("#lange").val() || 0;
  const widthDotted = $("#breite").val() || 0;
  const heightDotted = $("#höhe").val() || 0;
  const length = lengthDotted ? lengthDotted.replace(/\./g, "") : 0;
  const width = widthDotted ? widthDotted.replace(/\./g, "") : 0;
  const height = heightDotted ? heightDotted.replace(/\./g, "") : 0;

  let isInvalid = false;
  let msgLength = "Bitte geben sie die Länge ein";
  let msgWidth = "Bitte geben sie die Breite ein";
  let msgHeight = "Bitte geben sie die Höhe ein";

  if (
    !regex.test(length) ||
    (lengthDotted && lengthDotted.length > 36) ||
    length <= 0 ||
    !length
  ) {
    isInvalid = true;
    $("#lange").addClass("is-invalid");
    if (!regex.test(length)) msgLength = "Bitte geben sie eine Zahl ein";
    if (lengthDotted && lengthDotted.length > 36)
      msgLength = "Die Länge muss weniger als 37 Zeichen betragen";
  }

  if (
    !regex.test(width) ||
    (widthDotted && widthDotted.length > 36) ||
    width <= 0 ||
    !width
  ) {
    isInvalid = true;
    $("#breite").addClass("is-invalid");
    if (!regex.test(width)) msgWidth = "Bitte geben sie eine Zahl ein";
    if (widthDotted && widthDotted.length > 36)
      msgLength = "Die Breite muss weniger als 37 Zeichen betragen";
  }

  if (
    !regex.test(height) ||
    (heightDotted && heightDotted.length > 36) ||
    height <= 0 ||
    !height
  ) {
    isInvalid = true;
    $("#höhe").addClass("is-invalid");
    if (!regex.test(height)) msgHeight = "Bitte geben sie eine Zahl ein";
    if (heightDotted && heightDotted.length > 36)
      msgLength = "Die Höhe muss weniger als 37 Zeichen betragen";
  }

  if (isInvalid) {
    $("#langeMsg").text(msgLength);
    $("#breiteMsg").text(msgWidth);
    $("#höheMsg").text(msgHeight);
    return;
  }

  const volume = length * width * height;
  const result = volume ? volume / 1000000 : 0;
  const classVolume = getClassVolume(result);

  if (result > 0) {
    resetResult();

    $("<div>", {
      id: "result-container",
      class: "container-fluid pt-3",
    }).appendTo("#show-info");
    $("<div>", { id: "result-section", class: "custom-section" }).appendTo(
      "#result-container"
    );
    $("<div>", { id: "result-row", class: "result-container row" }).appendTo(
      "#result-section"
    );
    $("<div>", {
      id: "result-col-one",
      class: "col-sm-4 title bold",
      style: "margin-bottom:15px;",
    }).appendTo("#result-row");
    $("<div>", { id: "result-col-two", class: "col-sm-4" }).appendTo(
      "#result-row"
    );
    $("<div>", { id: "result", class: "result bold" }).appendTo(
      "#result-col-two"
    );
    $("#result-col-one").text(
      "Dieses Fahrzeug zählt zur Fahrzeuggrößenklasse:"
    );
    $("#result").text(classVolume);

    $("<div>", { id: "pdf-container", class: "container-fluid pt-3" }).appendTo(
      "#show-info"
    );
    $("<div>", { id: "pdf-section", class: "custom-section" }).appendTo(
      "#pdf-container"
    );
    $("<div>", {
      id: "pdf-row",
      class: "result-container row center",
    }).appendTo("#pdf-section");
    $("<div>", { id: "pdf-col", class: "col-sm-4" }).appendTo("#pdf-row");
    $("<button>", {
      id: "pdf-download",
      class: "btn btn-custom background-light-blue-second",
      type: "button",
    }).appendTo("#pdf-col");
    $("#pdf-download").text("Zertifikat drucken");
    $("#pdf-download").on("click", function () {
      $.get("resources/html/pdf.html", { _: $.now() })
        .done(function (data) {
          const html = $.parseHTML(data);
          const doc = new jsPDF("portrait", "pt", "a4", true, true);
          const date = getCurrentDate("dd.mm.yyyy");

          $(html).find(".date-pdf").text(`Ermittelt am ${date}`);
          $(html).find("#model").text(model);
          $(html).find("#länge").text(lengthDotted);
          $(html).find("#breite").text(widthDotted);
          $(html).find("#höhe").text(heightDotted);
          $(html).find("#klasse").text(classVolume);

          doc.addFileToVFS("Karla.ttf", fontRegularBase64());
          doc.addFont("Karla.ttf", "Karla", "normal");
          doc.setFont("Karla");

          doc.addFileToVFS("Karla-bold.ttf", fontBoldBase64());
          doc.addFont("Karla-bold.ttf", "Karla", "bold");
          doc.setFont("Karla");

          doc.html($(html).html(), {
            margin: 50,
            html2canvas: { width: 500 },
            callback: function (doc) {
              doc.save("Zertifikat.pdf");
            },
          });
        })
        .fail(function (jqXHR, textStatus) {
          console.error(jqXHR);
        });
    });
  }
};

const getClassVolume = (result) => {
  let classVolume = "";

  if (result >= 18500) {
    classVolume = "XXL";
  } else if (result >= 15000 && result < 18500) {
    classVolume = "XL";
  } else if (result >= 11500 && result < 15000) {
    classVolume = "L";
  } else if (result >= 8000 && result < 11500) {
    classVolume = "M";
  } else if (result >= 4500 && result < 8000) {
    classVolume = "S";
  } else if (result >= 1000 && result < 4500) {
    classVolume = "XS";
  } else if (result < 1000) {
    classVolume = "XXS";
  } else {
    classVolume = "";
  }

  return classVolume;
};

const numberWithDots = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const resetResult = () => {
  $("#show-info").empty();
};

const getCurrentDate = (format) => {
  const date = new Date();

  const map = {
    mm: date.getMonth() + 1,
    dd: date.getDate(),
    yyyy: date.getFullYear(),
  };

  if (map.dd < 10) map.dd = "0" + map.dd;
  if (map.mm < 10) map.mm = "0" + map.mm;

  return format.replace(/mm|dd|yyyy/gi, (matched) => map[matched]);
};
