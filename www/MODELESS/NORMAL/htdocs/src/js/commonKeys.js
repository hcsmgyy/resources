function getOptionsByLabel(vm,label) {
    switch (label) {
        case "N/A": return vm.$t("NA");
        case "DND": return vm.$t("DND");
        case "Menu": return vm.$t("Menu");
        case "MSG": return vm.$t("MSG");
        case "Status": return vm.$t("Status");
        case "System Info": return vm.$t("SystemInfo");
        case "Book": return vm.$t("Book");
        case "Fwd": return vm.$t("Fwd");
        case "PickUp": return vm.$t("PickUp");

        case "Group PickUp": return vm.$t("GroupPickUp");
        case "Intercom": return vm.$t("Intercom");
        case "Speed Dial": return vm.$t("SpeedDial");
        case "History": return vm.$t("tHistory");
        case "Favorites": return vm.$t("Favorite");
        case "Redial": return vm.$t("Redial");
        case "Account": return vm.$t("Account");
        case "ACD": return vm.$t("ACD");
        case "BLF": return vm.$t("BLF");
        case "BLFList": return vm.$t("BLFList");
        case "CallReturn": return vm.$t("CallReturn");
        case "HotDesking": return vm.$t("HotDesking");
        case "Record": return vm.$t("Record");
        case "XML Browser": return vm.$t("XMLBrowser");
        case "DTMF": return vm.$t("DTMF");
        case "Multicast Paging": return vm.$t("MulticastPaging");
        case "Simple Menu": return vm.$t("SimpleMenu"); 
        case "Voice Message": return vm.$t("VoiceMessage");
        case "Transfer": return vm.$t("Transfer");
        case "Call Park": return vm.$t("CallPark");
        case "XML PhoneBook": return vm.$t("XMLPhoneBook");
        case "XML History": return vm.$t("XMLHistory");
        case "XML VoiceMail": return vm.$t("XMLVoiceMail");
        case "URL": return vm.$t("URL");
        case "Hold": return vm.$t("Hold");
        case "Conference": return vm.$t("Conference");
        case "RobinCall": return vm.$t("RobinCall");
        case "RF Number": return vm.$t("RFNumber");
        case "Calling": return vm.$t("Calling");
        case "Open Message": return vm.$t("MsgOpen");
        case "Live View": return vm.$t("LiveView");
        case "Dial": return vm.$t("Dial");
        case "Unlock": return vm.$t("Unlock");
        case "Call": return vm.$t("Call");
        case "Arming": return vm.$t("Arming");
        case "Intrude": return vm.$t("Intrude");
        case "Message": return vm.$t("Message");
        case "Contact": return vm.$t("Contacts");
        case "Settings": return vm.$t("Settings");
        case "Calendar": return vm.$t("Calendar");
        case "Application": return vm.$t("Application");
        case "Folder": return vm.$t("Folder");
        case "Screen Saver": return vm.$t("ScreenSaver");
        case "Call Out": return vm.$t("CallOut");
        case "Lift Control": return vm.$t("LiftControl");
        case "Home Page": return vm.$t("HomePage");
        case "Assistance": return vm.$t("Assistance");
        case "Custom APK": return vm.$t("CustomAPK");
        case "Call Elevator": return vm.$t("CallElevator");
        case "Config URL": return vm.$t("ConfigURL");
        case "Display": return vm.$t("Display");
        case "Sound": return vm.$t("Sound");
        case "SOS": return vm.$t("SOS");
        case "Motion Detection": return vm.$t("MotionDetection");
        case "Monitor": return vm.$t("PhoneMonitor");
        case "More": return vm.$t("More");
        case "Applications": return vm.$t("Applications");
        case "Screen Off": return vm.$t("ScreenOff");
        case "Control4 Unlock": return vm.$t("Control4Unlock");
        case "Relays": return vm.$t("Relays");
        case "Browser": return vm.$t("Browser");
        case "Concierge": return vm.$t("Concierge");
        case "Lift": return vm.$t("Lift");
        case "Missed Call": return vm.$t("MissedCallLabel");
        case "Notice Board": return vm.$t("NoticeBoard");
        case "Demo": return vm.$t("Demo");
        case "Screen Clean": return vm.$t("ScrennClean");
        case "All Call": return vm.$t("AllCall");
        default: return vm.$t("NA");;
    }
}


export {
    getOptionsByLabel
}