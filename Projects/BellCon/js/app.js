const navbarList = document.querySelector('.navbar-nav');
const navbarMenu = document.querySelector('#navbarNavAltMarkup');
const highlightsList = document.querySelector('#highlights-list');
const forms = document.getElementsByClassName('needs-validation');
const checkboxGroup = document.querySelector('.checkbox-group');

// ensure at least one checkbox is checked
function validateInterestsCheckboxGroup() {
    var failed = false;
    const interests = document.querySelectorAll('[name="interests"]');
    const interestsChecked = document.querySelectorAll('[name="interests"]:checked');

    if (interestsChecked.length === 0) {
        for (i=0; i < interests.length; i++) {
            interests[i].required = true;
        }
        failed = true;
    } else {
        for (i=0; i < interests.length; i++) {
            interests[i].required = false;
        }
    }
    return failed;
}

// collapse navbar after clicking a link inside it
navbarList.addEventListener('click', () => {
    if (navbarMenu.classList.contains('show')) {
        navbarMenu.classList.toggle('show');
    }
});

// expand schedule list item after clicking link to it from highlights list item
highlightsList.addEventListener('click', (e) => {
    const talkId = e.target.getAttribute('href');
    const speaker = talkId.split('-')[0];
    const talkDescriptionId = `${speaker}-desc`;
    const talkDescription = document.querySelector(talkDescriptionId);
    console.log(talkDescription);
    if (talkDescription && !talkDescription.classList.contains('show')) {
        talkDescription.classList.toggle('show');
    }
});

// validate registration form input after clicking submit button
const validation = Array.prototype.filter.call(forms, function(form) {
    form.addEventListener('submit', function(event) {
        var failed = false;
        failed = validateInterestsCheckboxGroup();

        if (form.checkValidity() === false) {
            failed = true;
        }

        if (failed) {
            event.preventDefault();
            event.stopPropagation();
        }
        form.classList.add('was-validated');
        }, false);
});

// validate checkbox input in real time
checkboxGroup.addEventListener('click', validateInterestsCheckboxGroup);