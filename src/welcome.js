import { setView } from './view';


function onLoadComplete() {
    let buttons = document.querySelectorAll('#welcome .buttons button');
    for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];
        button.addEventListener('click', handleStartClick);
    }
    let buttonWrapper = document.querySelector('#welcome .buttons');
    if (buttonWrapper) {
        buttonWrapper.style.display = 'block';
    }
}

function handleStartClick(event) {
    console.log(event.target.value);
    event.preventDefault();
    setView('app');
}

export { onLoadComplete };