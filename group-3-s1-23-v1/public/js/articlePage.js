document.addEventListener('DOMContentLoaded', function () {
  const editButton = document.querySelector('.btn-edit');
  const followButton = document.querySelector('.btn-follow');
  const likeButton = document.querySelector('.btn-like');
  const countLikes = document.querySelector('.countLikes');
  const countLikesElement = document.querySelector('.countLikes.btn-number');
  const commentButton = document.querySelector('.btn-comment');
  const closeButton = document.querySelector('.btn-close');
  const replyButtons = document.querySelectorAll('.btn-reply');
  const showCommentButtons = document.querySelectorAll('.btn-show-comment');
  const replyButtons01 = document.querySelectorAll('.btn-reply01');
  const childShowCommentButtons01 = document.querySelectorAll(
    '.child-btn-show-comment01'
  );
  const cancelButtons = document.querySelectorAll('.btn-cancel');
  const responseButtons = document.querySelectorAll('.btn-submit');
  const deleteButtons = document.querySelectorAll('.btn-delete');
  const authorIdElement = document.getElementById('authorId');
  let authorId; // Declare the variable outside the block
  if (authorIdElement) {
    authorId = authorIdElement.dataset.authorId; // Assign a value to it inside the block
  }
  if (userId) {
    const loginInfos = document.querySelectorAll('.user-info-class');
    loginInfos.forEach(function (loginInfo) {
      loginInfo.style.display = 'none';
    });
  } else {
    const commentInputs = document.querySelectorAll('.input-comment');
    commentInputs.forEach(function (input) {
      const inputContainer = input.closest('.comment-input');
      inputContainer.style.pointerEvents = 'auto';
      inputContainer.style.opacity = '1';
    });

    const loginInfoContainers = document.querySelectorAll('.user-info-class');
    loginInfoContainers.forEach(function (loginInfoContainer) {
      loginInfoContainer.style.pointerEvents = 'auto';
      loginInfoContainer.style.opacity = '1';
    });
  }

  document.addEventListener('input', function (e) {
    if (e.target.matches('.input-comment')) {
      const comment = e.target.value;
      const count = comment.length;
      if (!userId) {
        e.target.value = 'Please log in to comment.';
        e.target.disabled = true;
      } else {
        if (count > 256) {
          comment = comment.slice(0, 256);
          e.target.value = comment;
          count = 256;
        }
        e.target.parentElement.querySelector('.character-count').innerText =
          count + '/256';
      }
    }
  });

  cancelButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const inputField = button
        .closest('.comment-input')
        .querySelector('.input-comment');
      inputField.value = '';
    });
  });
  // Add event listener to the container
  document
    .querySelector('.sidebar-content')
    .addEventListener('click', function (event) {
      let button = event.target.closest('.btn-submit');
      if (button) {
        let buttonContainer = button.parentElement;
        let commentInputContainer = buttonContainer.parentElement;
        let inputField = commentInputContainer.querySelector('.input-comment');
        if (inputField) {
          const content = inputField.value;
          const parentComment = button.dataset.parentId;

          let comment = {
            content: content,
            commenterId: userId,
            parentComment:
              button.dataset.parentId === 'NULL'
                ? null
                : button.dataset.parentId,
          };

          fetch('/addComment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(comment),
          })
            .then((response) => {
              return response.json();
            })
            .then((ignored) => {
              location.reload();
            })
            .catch((error) => {
              console.error('Error:', error);
            });

          inputField.value = '';
        } else {
          console.error('No input field found.');
        }
      } else {
        console.error('No button clicked.');
      }
    });

  const isLiked = likeButton.classList.contains('liked');
  const isSubscribed = followButton.classList.contains('subscribed');
  // Check whether it has been subscribed, and operate according to the status
  if (isSubscribed) {
    // Set the button txt to "Followed" and change the color
    followButton.querySelector('.btn-text').textContent = 'Followed';
    followButton.querySelector('.btn-text').style.color = 'var(--color-5)';
    //Set the button to Followed color
    followButton.classList.add('clicked');
  }
  // Check whether it has been liked, and operate according to the status
  if (isLiked) {
    // Set the button to red
    likeButton.classList.add('liked');
  }

  if (editButton) {
    editButton.addEventListener('click', () => {
      window.location.href = `/editArticle${editButton.dataset.articleId}`;
    });
  }

  followButton.addEventListener('click', function () {
    // Verify if the user is logged in
    if (typeof userId === 'undefined' || !userId) {
      alert('Please log in first!' + userId);
      return;
    }
    // Build the request data object including the authorId and userId
    const requestData = {
      authorId: followButton.dataset.authorId,
      userId: userId,
    };
    if (followButton.classList.contains('subscribed')) {
      // Button has already been clicked, perform unfollow operation

      // Send a DELETE request to the server to delete the database entry
      fetch('unsubscribe', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error(response.statusText); // Throw an error to enter the catch callback
          }
          return response.json();
        })
        .then(function (data) {
          // Update the button text and color
          followButton.querySelector('.btn-text').textContent = 'Follow';
          followButton.querySelector('.btn-text').style.color =
            'var(--color-1)';
          // Update the button color
          followButton.classList.remove('subscribed');
        })
        .catch(function (error) {
          console.error('Request failed', error);
        });
    } else {
      //  Perform follow operation

      // Send a POST request to the server to add a database entry
      fetch('/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          // Update the button text and color
          followButton.querySelector('.btn-text').textContent = 'Followed';
          followButton.querySelector('.btn-text').style.color =
            'var(--color-5)';
          // Update the button color
          followButton.classList.add('subscribed');
        })
        .catch(function (error) {
          console.error('Request failed', error);
        });
    }
  });

  likeButton.addEventListener('click', function () {
    // Verify if the user is logged in
    if (typeof userId === 'undefined' || !userId) {
      alert('Please log in first!');
      return;
    }
    // Build the request data object including articleId and userId
    const requestData = {
      articleId: likeButton.dataset.articleId,
      userId: userId,
    };

    if (likeButton.classList.contains('liked')) {
      // Button has already been clicked, perform unlike operation

      // Send a DELETE request to the server to delete the database entry
      fetch('/unlikeArticle', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error(response.statusText); // Throw an error to enter the catch callback
          }
          return response.json();
        })
        .then(function (data) {
          // Handle the result of unlike operation
          countLikesElement.textContent = data.count.count;

          // Remove the like styles
          likeButton.classList.remove('clicked');
          likeButton.classList.remove('liked');
        })
        .catch(function (error) {
          console.error('likeButton unlike', error);
          // Display error message to the user
          alert('An error occurred: ' + error.message);
        });
    } else {
      // Button hasn't been clicked, perform like operation

      // Send a POST request to the server to add a database entry
      fetch('/likeArticle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          // Handle the result of like operation
          countLikesElement.textContent = data.count.count;

          // Add the like styles
          likeButton.classList.add('clicked');
          likeButton.classList.add('liked');
        })
        .catch(function (error) {
          console.error('likeButton like', error);
        });
    }
  });

  commentButton.addEventListener('click', async function () {
    const sidebar = document.querySelector('.sidebar-articlePage');
    sidebar.classList.toggle('show');
  });

  closeButton.addEventListener('click', function () {
    const sidebar = document.querySelector('.sidebar-articlePage');
    sidebar.classList.remove('show');
  });

  replyButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const inputModule = button.closest('li').querySelector('.input-content');
      inputModule.style.display =
        inputModule.style.display === 'none' ? 'block' : 'none';
    });
  });
  const commentModules = document.querySelectorAll(
    '.dropdown-content, .child-dropdown-content01'
  );
  commentModules.forEach(function (module) {
    module.style.display = 'block';
  });
  showCommentButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const childCommentsModule = button
        .closest('li')
        .querySelector('.dropdown-content');
      childCommentsModule.style.display =
        childCommentsModule.style.display === 'none' ? 'block' : 'none';
    });
  });

  replyButtons01.forEach(function (button) {
    button.addEventListener('click', function () {
      const inputModule = button
        .closest('li')
        .querySelector('.input-content01');
      inputModule.style.display =
        inputModule.style.display === 'none' ? 'block' : 'none';
    });
  });

  childShowCommentButtons01.forEach(function (button) {
    button.addEventListener('click', function () {
      const childCommentsModule = button
        .closest('li')
        .querySelector('.child-dropdown-content01');
      childCommentsModule.style.display =
        childCommentsModule.style.display === 'none' ? 'block' : 'none';
    });
  });

  // Delete comment when user login and click delete button
  // Common user can only delete their own comments and only author can delete all comments
  deleteButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      // Find the closest 'li' ancestor of the button, which contains the whole comment
      const commentElement = button.closest('li');

      // Get the 'div' element with the 'comment-infor01' class inside the 'li' element
      const commentInfoElement =
        commentElement.querySelector('.comment-infor01');

      // Get the commenterId from the 'data-commenter-id' attribute of the 'div' element
      const commenterId = commentInfoElement.dataset.commenterId;

      // Verify if the user is the author of the article or the commenter
      const commentId = button.dataset.commentId;
      if (userId === authorId || userId === commenterId) {
        // Build the request data object including articleId and userId
        const requestData = {
          commentId: commentId,
        };
        // Send a DELETE request to the server to delete the database entry
        fetch('/deleteComment', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        })
          .then(function (response) {
            if (!response.ok) {
              throw new Error(response.statusText); // Throw an error to enter the catch callback
            }
            return response.json();
          })
          .then(function (data) {
            // Handle the result of delete operation
            button.closest('li').remove();
            location.reload();
          })
          .catch(function (error) {
            console.error('deleteButtons', error);
            // Display error message to the user
            alert('An error occurred: ' + error.message);
          });
      } else {
        alert('You can only delete your own comments!');
      }
    });
  });
});
