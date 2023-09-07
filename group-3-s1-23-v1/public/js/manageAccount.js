const editAccountBtn = selectElement('#editAccountBtn');
const deleteAccountBtn = selectElement('#deleteAccountBtn');
const username = selectElement('#username');
const password = selectElement('#password');
const repassword = selectElement('#re-password');
const usernameAvailability = selectElement('#username-availability');
const passwordsMatch = selectElement('#passwords-match');
const avatarListContainer = selectElement('.change-avatar-options');

async function addUsernameCompareEventListener() {
  try {
    const response = await fetch('/api/usernames');
    if (!response.ok) {
      throw new Error('Request to get usernames failed');
    }
    const usernamesObjs = await response.json();
    const usernamesArr = usernamesObjs.map((username) => username.username);
    username.addEventListener('change', (e) => {
      if (usernamesArr.includes(username.value)) {
        usernameAvailability.innerText = '\u274C Username is already in use';
        usernameAvailability.style.color = 'red';
        editAccountBtn.disabled = true;
      } else {
        usernameAvailability.innerText = '\u2713 Username is valid';
        usernameAvailability.style.color = 'green';
        editAccountBtn.disabled = false;
      }
    });
  } catch (error) {
    console.error(error);
  }
}
addUsernameCompareEventListener();

repassword.addEventListener('change', (e) => {
  if (password.value !== repassword.value) {
    passwordsMatch.innerText = '\u274C Passwords do not match';
    passwordsMatch.style.color = 'red';
    editAccountBtn.disabled = true;
  } else {
    passwordsMatch.innerText = '\u2713 Passwords match';
    passwordsMatch.style.color = 'green';
    editAccountBtn.disabled = false;
  }
});

const avatarImages = document.querySelectorAll('.avatar-image');

avatarImages.forEach((avatar) => {
  avatar.addEventListener('click', function () {
    clearAvatarImages();
    const radioId = avatar.id.replace('img-', '');
    const radioInput = document.getElementById(radioId);
    radioInput.checked = true;
    avatar.style = 'border-color: #7b95f2;';
  });
});

function clearAvatarImages() {
  avatarImages.forEach((avatar) => {
    const radioId = avatar.id.replace('img-', '');
    const radioInput = document.getElementById(radioId);
    radioInput.checked = false;
    avatar.style = 'border: none';
  });
}

function changePassword() {
  const changePassWordForms = document.querySelectorAll(
    '.change-Password-form'
  );

  changePassWordForms.forEach((element) => {
    if (element.disabled) {
      element.disabled = false;
      element.style.visibility = 'visible';
      passwordsMatch.style.display = 'block'
    } else {
      element.disabled = true;
      element.style.visibility = 'hidden';
      passwordsMatch.style.display = 'none'
    }
  });
}

function changeAvatar() {
  const radioList = document.querySelectorAll('.avatar-radio');

  radioList.forEach((radio) => {
    if (radio.disabled) {
      radio.disabled = false;
      radio.visibility = 'visible';
      avatarListContainer.style.display = 'block';
    } else {
      clearAvatarImages()
      radio.disabled = true;
      radio.style.visibility = 'hidden';
      avatarListContainer.style.display = 'none';
    }
  });
}

editAccountBtn.addEventListener('click', async (e) => {
  e.preventDefault();

  const formData = new FormData(selectElement('#manageAccount-form'));

  fetch('/editAccount/update', {
    method: 'PUT',
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        window.location.href = 'userbrowsing';
      } else {
        console.error('Failed to update account');
      }
    })
    .catch((error) => {
      console.error('Error updating account', error);
    });
});

deleteAccountBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  
  fetch('/editAccount/delete', {
    method: 'DELETE',
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        window.location.href = '/';
      } else {
        console.error('Failed to delete account');
      }
    });
});
