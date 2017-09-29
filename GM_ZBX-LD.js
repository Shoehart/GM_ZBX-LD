// ==UserScript==
// @name         ZBX<->LD - wszystko w jednym
// @namespace    http://tampermonkey.net/
// @version      0.01 alpha
// @description  Link między ZBX a LD, do zutomatyzowania kreowania incydentów
// @author       RShT
// @match        https://pit-zabbix.net.pp/zabbix.php?action=dashboard.view*
// @match        https://servicedesk.net.pp/SD_Klient.WebAccess/wd/object/create.rails?class_name=IncidentManagement.Incident&lifecycle_name=NewProcess1111&object_template_name=Nowyszablon2683
// @match        https://servicedesk.net.pp/SD_Klient.WebAccess/wd/Object/Open.rails?class_name=IncidentManagement.Incident&key=*
// @require      https://code.jquery.com/jquery-3.2.1.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @grant        window.close
// @grant        window.focus
// ==/UserScript==

var adres = window.location.hostname;
if (adres == 'pit-zabbix.net.pp') {
    waitForKeyElements ('table.list-table', dodajKolumny);
}

function dodajKolumny(){
    if($("#buttonCheck").length === 0) {
        $("div#lastiss thead tr").append("<th>LD</th>");
        $("div#lastiss tbody tr").append('<td><input type="button" value="OK" id="buttonCheck"></td>');
        document.getElementById('lastiss_header').innerHTML = 'Niby 20 ostatnich, ale tak łatwo nie będzie.'; //testowy czy skrypt działa?
    }
}

function fireEvent(element,event){
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent(event, true, true ); // event type,bubbling,cancelable
    return !element.dispatchEvent(evt);
}

function daneDoFormularzy(){
    var levelOfTrigger = GM_getValue('levelOfTrigger');

    $('#mainForm-_UserDisplay').val('Hajdenrajch Marcin');
    $('#mainForm-Title').val(GM_getValue('hostIssue'));
    $('#mainForm-Description2').val(GM_getValue('hostIssue'));
    $('#mainForm-Category162Display').val('Zmiana - DOL - Dział Utrzymania Aplikacji');
    $('#mainForm-_ServiceDisplay').val('Nie dotyczy Usług');
    $('#mainForm-_AdresIP').val($.trim(GM_getValue('hostIssue').match(/(\d+)\.(\d+)\.(\d+)\.(\d+)\s+/gm)));

    switch (GM_getValue('levelOfTrigger')) {
            case 'high-bg': $('#mainForm-_IncidentUrgencyDisplay').val('Średni');
                break;
            case 'disaster-bg': $('#mainForm-_IncidentUrgencyDisplay').val('Pilny');
                break;
        }
    $('#mainForm-_ServiceDisplay').val('Nie dotyczy Usług');
}

function keyDown(el) {
    $(window).on('load', function() {
        fireEvent(el, 'keydown');
    });
}

function waitForElementToDisplay(selector, time) {
        if(document.querySelector(selector) !== null) {
            alert("The element is displayed, you can put your code instead of this alert.");
            return;
        }
        else {
            setTimeout(function() {
                waitForElementToDisplay(selector, time);
            }, time);
        }
    }

$(document).on('click', '#buttonCheck', function() {
    var row = $(this).closest('tr');
    GM_setValue('hostIssue', row.find('td:eq(0)').text() + ' ' + row.find('td:eq(1)').text());
    GM_setValue('levelOfTrigger', row.find('td:eq(1)').attr('class'));
    GM_setValue('addressOfAck', 'https://pit-zabbix.net.pp/' + $(this).parent().prev().prev().children().attr('href'));
    window.open("https://servicedesk.net.pp/SD_Klient.WebAccess/wd/object/create.rails?class_name=IncidentManagement.Incident&lifecycle_name=NewProcess1111&object_template_name=Nowyszablon2683", "_blank");
});

adres = window.location.href;
if (adres == 'https://servicedesk.net.pp/SD_Klient.WebAccess/wd/object/create.rails?class_name=IncidentManagement.Incident&lifecycle_name=NewProcess1111&object_template_name=Nowyszablon2683') {
    daneDoFormularzy();

    keyDown(document.getElementById('mainForm-_UserDisplay'));
    keyDown(document.getElementById('mainForm-_IncidentUrgencyDisplay'));
    keyDown(document.getElementById('mainForm-_ServiceDisplay'));
    keyDown(document.getElementById('mainForm-Category162Display'));
}