const calendarData = {
    "2025": {
        "January": null,
        "February": null,
        "March": null,
        "April": null,
        "May": null,
        "June": null,
        "July": null,
        "August": "https://drive.google.com/file/d/1doeAo4zKpD5SYV-IYYsv6ark6dYMu3VI/view?usp=drive_link",
        "September": "https://drive.google.com/file/d/1JlyzaXJFusbAVNsnKfoUJwL959FDAPDy/view?usp=drive_link",
        "October": "https://drive.google.com/file/d/1ADlac0c3tm2B_H7ywOgtzL_MyAYbvATg/view?usp=drive_link",
        "November": "https://drive.google.com/file/d/1EXYjm0iAimZFUVQr4z4k-iywIrj-TGyp/view",
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