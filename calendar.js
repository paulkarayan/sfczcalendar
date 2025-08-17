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
    // Display random lyric on page load
    const lyricDisplay = document.getElementById('lyric-display');
    if (lyricDisplay) {
        const randomIndex = Math.floor(Math.random() * lyrics.length);
        lyricDisplay.textContent = lyrics[randomIndex];
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