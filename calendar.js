const calendarData = {
    "2025": {
        "January": null,
        "February": null,
        "March": null,
        "April": null,
        "May": null,
        "June": null,
        "July": null,
        "August": null,
        "September": null,
        "October": null,
        "November": "https://drive.google.com/file/d/1EXYjm0iAimZFUVQr4z4k-iywIrj-TGyp/view",
        "December": "https://drive.google.com/file/d/111B0d1tX_Bnwh2Q1XHVM_5DN_SzkMt5-/view?usp=sharing"
    },
    "2026": {
        "January": "https://drive.google.com/file/d/1uH_If9DgUVF9hDBi8SIgj31P6YrvbsiO/view?usp=drive_link",
        "February": "https://drive.google.com/file/d/1_Nsia7QlNUU7X-iI4UuFgPi39Oq9_IKt/view?usp=drive_link",
        "March": "https://drive.google.com/file/d/1pAN8oHYPpwAPbu4kgk8CciQlD60a3ph5/view?usp=drive_link",
        "April": "https://drive.google.com/file/d/1FLscHpnmBkALm0iex1wjxDpIR-w4E9z9/view?usp=drive_link",
        "May": "https://drive.google.com/file/d/1SV44sHG8IGT9VeFqTG5xYA3Zwd4RDrZZ/view?usp=drive_link",
        "June": "https://drive.google.com/file/d/1mtZgiihLiOHNTbMiDTLdzBDXlc_kEM2o/view?usp=drive_link",
        "July": "https://drive.google.com/file/d/1-h-JXX-oaB32RHJzfJYSbOhd54PnbQU4/view?usp=drive_link",
        "August": "https://drive.google.com/file/d/1MV0xivCAzxIE0_VEOzsrzPJ7A3TgqkeW/view?usp=drive_link",
        "September": "https://drive.google.com/file/d/1zT8EEKNbCeO5NuU64XdG0xN5S-Vse556/view?usp=drive_link",
        "October": "https://drive.google.com/file/d/1qd_1hU0DSPWTJ37YAKnYp1VlVNp4Bzea/view?usp=drive_link",
        "November": null,
        "December": null
    }
};

const lyrics = [
    '"Laissez les bons temps rouler"',
    '"Allons danser Colinda"',
    '"Jolie blonde, regardez donc quoi t\'as fait"',
    '"J\'ai passé devant ta porte"',
    '"Hey la bas!"',
    '"Zydeco sont pas salés"',
    '"Paper in my shoe"',
    '"Who stole the hot sauce?"',
    '"Give him cornbread"',
    '"Madame Sosthene"',
    '"Dog Hill"',
    '"Motor Dude Special"',
    '"Johnnie can\'t dance"',
    '"Tee nah nah"',
    '"Bon ton roula"',
    '"Queen Ida gonna make you dance"',
    '"Play that Creole music"',
    '"Rosa Majeur"'
];

document.addEventListener('DOMContentLoaded', function() {
    // Display random lyric in footer
    const footerLyric = document.getElementById('footer-lyric');
    if (footerLyric) {
        const randomIndex = Math.floor(Math.random() * lyrics.length);
        footerLyric.textContent = lyrics[randomIndex];
    }

    const calendarLinks = document.querySelectorAll('.calendar-link');
    
    calendarLinks.forEach((link) => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const monthElement = this.querySelector('h3');
            const monthText = monthElement.textContent;
            const [month, year] = monthText.split(' ');
            
            if (calendarData[year] && calendarData[year][month]) {
                window.open(calendarData[year][month], '_blank');
            } else {
                alert(`The ${monthText} calendar is not yet available. Please check back later or contact Ellen at epapper@sbcglobal.net`);
            }
        });
    });
});