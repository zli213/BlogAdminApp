// Set up WYSIWYG editor
const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'], // toggled buttons
  ['blockquote', 'code-block'],

  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
  [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
  [{ direction: 'rtl' }], // text direction

  [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],

  ['clean'], // remove formatting button
];

const editor = new Quill('#editor', {
  modules: {
    toolbar: toolbarOptions,
  },
  placeholder: 'Compose an epic...',
  theme: 'snow',
});

const imageUploadForm = selectElement('#imageUploadForm');
const imageUploadSuccess = selectElement('#imageUploadSuccess');
const imageUploadFailure = selectElement('#imageUploadFailure');
const clearBtn = selectElement('#clear-btn');
const updateBtn = document.querySelector('#update-btn');
const publishBtn = document.querySelector('#publish-btn');
const deleteBtn = document.querySelector('#delete-btn');
let imageSrc = imageUploadForm.dataset.articleImgSrc
  ? imageUploadForm.dataset.articleImgSrc
  : '';
let articleId = imageUploadForm.dataset.articleId
  ? imageUploadForm.dataset.articleId
  : false;

imageUploadForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(imageUploadForm);

  fetch('/api/addImage', {
    method: 'POST',
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Image upload failed. Please try again.'); // Throw an error for non-2xx responses
      }
      return response.json();
    })
    .then((data) => {
      // On successful upload, hide the form and display the success message
      imageUploadForm.style.display = 'none';
      imageUploadFailure.style.display = 'none';
      imageUploadSuccess.style.display = 'block';
      imageSrc = data;
    })
    .catch((error) => {
      console.error('Error uploading image:', error);
      imageUploadFailure.style.display = 'block';
    });
});

clearBtn.addEventListener('click', () => {
  editor.setContents({ insert: '\n' });
});

if (updateBtn) {
  updateBtn.addEventListener('click', (e) => {
    e.preventDefault();
    fetch('/article/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: prepareArticleData(),
    })
      .then((response) => response.json())
      .then((data) => {
        window.location.href = `/articlePage?id=${data.articleId}`;
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  });
}

if (publishBtn) {
  publishBtn.addEventListener('click', (e) => {
    e.preventDefault();

    fetch('/article/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: prepareArticleData(),
    })
      .then((response) => response.json())
      .then((data) => {
        window.location.href = `/articlePage?id=${data.articleId}`;
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  });
}

if (deleteBtn) {
  deleteBtn.addEventListener('click', (e) => {
    e.preventDefault();

    fetch('/article/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({'articleId': articleId}),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.isDeleted) {
          window.location.href = '/userbrowsing';
        } else {
          console.error('Failed to delete the article')
        }
      })
      .catch((error) => {
        console.error('Error deleting article')
      })
  });
}

function prepareArticleData() {
  // Sanitize HTML to store in database
  const content = DOMPurify.sanitize(editor.root.innerHTML);
  const title = selectElement('#title').value;

  // Set a default image URL if no image was selected
  if (imageSrc === '') {
    imageSrc = '/images/avatar1.svg';
  }

  // Prepare the data to be sent to the server
  let articleData = {};
  if (articleId) {
    articleData = {
      title: title,
      content: JSON.stringify(content),
      imageSrc: imageSrc,
      id: articleId,
    };
  } else {
    articleData = {
      title: title,
      content: JSON.stringify(content),
      imageSrc: imageSrc,
    };
  }
  return (stringifiedArticleData = JSON.stringify(articleData));
}
