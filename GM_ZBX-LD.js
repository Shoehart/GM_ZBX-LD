// ==UserScript==
// @name         ZBX<->LD - wszystko w jednym
// @namespace    http://tampermonkey.net/
// @version      0.01 alpha
// @description  Link między ZBX a LD, do zutomatyzowania kreowania incydentów
// @author       RShT
// @match        https://pit-zabbix.*
// @match        https://servicedesk.*
// @require      https://code.jquery.com/jquery-3.2.1.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @grant        window.close
// @grant        window.focus
// ==/UserScript==

var hostsDict = {
    'temp': '10.1.1.1',
};

function dodajKolumny(){
    if($("#buttonCheck").length === 0) {
        $("div#lastiss thead tr").append("<th>LD</th>");
        $("div#lastiss tbody tr").append('<td><input type="button" value="OK" id="buttonCheck"></td>');
        $('#lastiss_header').text('Niby 20 ostatnich, ale tak łatwo nie będzie.'); //testowy czy skrypt działa?
    }
}

function daneDoFormularzy(){
    $('#mainForm-Title').val(GM_getValue('hostIssue'));
    $('#mainForm-Description2').val(GM_getValue('hostIssue'));
    $('#mainForm-_UserDisplay').val('Hajdenrajch Marcin');

    //IP
    $('#mainForm-_AdresIP').val($.trim(GM_getValue('hostIssue').match(/(\d+)\.(\d+)\.(\d+)\.(\d+)\s+/gm)));
    if ($('#mainForm-_AdresIP').val() === '') {
        for(var key in hostsDict) {
            if (key == GM_getValue('hostName')){
                $('#mainForm-_AdresIP').val(hostsDict[key]);}}}}

function fireEvent(element,event){
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent(event, true, true); // event type,bubbling,cancelable
    return !element.dispatchEvent(evt);
}

function keyDown(el, eventTxt) {
    $(window).on('load', function() {
        fireEvent(el, 'keydown');
    });
}

var adres = window.location.hostname;
if (adres == 'pit-zabbix.net.pp') {
    waitForKeyElements('table.list-table', dodajKolumny);
}

$(document).on('click', '#buttonCheck', function() {
    var row = $(this).closest('tr');
    GM_setValue('hostName', row.find('td:eq(0)').text());
    GM_setValue('hostIssue', row.find('td:eq(0)').text() + ' ' + row.find('td:eq(1)').text());
    GM_setValue('levelOfTrigger', row.find('td:eq(1)').attr('class'));
    GM_setValue('addressOfAck', 'https://pit-zabbix.net.pp/' + $(this).parent().prev().prev().children().attr('href'));
    window.open("https://servicedesk.net.pp/SD_Klient.WebAccess/wd/object/create.rails?class_name=IncidentManagement.Incident&lifecycle_name=NewProcess1111&object_template_name=Nowyszablon2683", "_blank");
});

// Wait for element to exist.
function elementLoaded(el, cb) {
    if ($(el).length) {
        // Element is now loaded.
        cb($(el));
    } else {
        // Repeat every 500ms.
        setTimeout(function() {
            elementLoaded(el, cb);
        }, 300);
    }
}

function User(){
    keyDown(document.getElementById('mainForm-_UserDisplay'), 'keydown');
    elementLoaded('#mainForm-_User-Dropdown > .dropdownContent > div:nth-child(2)', function(el) {
    // Element is ready to use.
        $(function() {
            fireEvent(document.querySelector('#mainForm-_User-Dropdown > .dropdownContent > div:nth-child(2)'), 'click');
        });
    });
}

function Pilnosc() {
    keyDown(document.getElementById('mainForm-_IncidentUrgencyDisplay'), 'keydown');
    elementLoaded('#mainForm-_IncidentUrgency-Dropdown > div > div:nth-child(2)', function(el) {
        $(function() {
            switch (GM_getValue('levelOfTrigger')) {
                case 'high-bg':
                    fireEvent(document.querySelector('#mainForm-_IncidentUrgency-Dropdown > div > div:nth-child(4)'), 'click');
                    break;
                case 'disaster-bg':
                    fireEvent(document.querySelector('#mainForm-_IncidentUrgency-Dropdown > div > div:nth-child(2)'), 'click');
                    break;
            }
        });
    });
}

function Usluga(){
    keyDown(document.getElementById('mainForm-_ServiceDisplay'), 'click');
    elementLoaded('#mainForm-_Service-Dropdown > div > div:nth-child(3)', function(el){
        $(function() {
            fireEvent(document.querySelector('#mainForm-_Service-Dropdown > div > div:nth-child(3)'), 'click');
        });
    });
}

function Kategoria(){
    fireEvent(document.getElementById('mainForm-Category162Display'), 'click');
    elementLoaded('.treeControl > div:nth-child(9) > img', function(el){
        $(function() {
            fireEvent(document.querySelector('.treeControl > div:nth-child(9) > img'), 'click');
        });
    });
    fireEvent(document.getElementById('mainForm-Category162Display'), 'click');
    fireEvent(document.querySelector('.treeChildDiv > div:nth-child(6) > span'), 'click');
}

adres = window.location.href;
if (adres == 'https://servicedesk.net.pp/SD_Klient.WebAccess/wd/object/create.rails?class_name=IncidentManagement.Incident&lifecycle_name=NewProcess1111&object_template_name=Nowyszablon2683') {

    //Zgłaszający
    daneDoFormularzy();

    User();
    Pilnosc();
    Usluga();
    Kategoria();
}
