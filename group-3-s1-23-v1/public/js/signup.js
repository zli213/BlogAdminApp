const username = selectElement('#username')
const password = selectElement('#password')
const repassword = selectElement('#re-password')
const submitBtn = selectElement('.first-button')
const usernameAvailability = selectElement('#username-availability')
const passwordsMatch = selectElement('#passwords-match')

async function addUsernameCompareEventListener() {
    try {
        const response = await fetch('/api/usernames');
        if (!response.ok) {
            throw new Error('Request to get usernames failed');
        }
        const usernamesObjs = await response.json();
        const usernamesArr = usernamesObjs.map(username => username.username);
        username.addEventListener('change', e => {
            if (usernamesArr.includes(username.value)) {
                usernameAvailability.innerText = '\u274C Username is already in use'
                usernameAvailability.style.color = 'red'
                submitBtn.disabled = true

            } else {
                usernameAvailability.innerText = '\u2713 Username is valid'
                usernameAvailability.style.color = 'green'
                submitBtn.disabled = false
            }
        })
    } catch (error) {
        console.error(error);
    }
}
addUsernameCompareEventListener()

repassword.addEventListener('change', e => {
    if (password.value !== repassword.value) {
        passwordsMatch.innerText = '\u274C Passwords do not match'
        passwordsMatch.style.color = 'red'
        submitBtn.disabled = true
    } else {
        passwordsMatch.innerText = '\u2713 Passwords match'
        passwordsMatch.style.color = 'green'
        submitBtn.disabled = false
    }
})

const avatarImages = document.querySelectorAll('.avatar-image');

avatarImages.forEach((avatar) => {
    avatar.addEventListener('click', function() {
        clearAvatarImages()
        const radioId = avatar.id.replace('img-', '');
        const radioInput = document.getElementById(radioId);
        radioInput.checked = true
        avatar.style = 'border-color: #7b95f2;'
    });
});

function clearAvatarImages() {
    avatarImages.forEach((avatar) => {
        const radioId = avatar.id.replace('img-', '');
        const radioInput = document.getElementById(radioId);
        radioInput.checked = false
        avatar.style = 'border: none'
    })
}
