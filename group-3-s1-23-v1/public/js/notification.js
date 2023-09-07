const notificationDropdown = document.querySelector(".notification-dropdown");
const notificationBadge = document.querySelector(".notification-badge");

function getNotifications() {
  fetch("/notifications")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      data.forEach((subscription) => {
        subscription.notifications.forEach((notification) => {
          const notificationLink = document.createElement("a");
          notificationLink.classList.add("notification-item-link");
          switch (notification.notification_type) {
            case "new_article":
              notificationLink.href = `/articlePage?id=${notification.article_id}`;
              break;
            case "new_comment":
              notificationLink.href = `/articlePage?id=${notification.article_id}`;
              break;
            case "new_subscriber":
              notificationLink.href = `/authorPage/${subscription.subscription.subscriber}`;
              break;
            default:
              notificationLink.href = `/`; // Modify as per your requirement
          }

          const notificationItem = document.createElement("div");
          notificationItem.classList.add("notification-item");
          if (!notification.read_status) {
            notificationItem.classList.add("unread");
          }

          const authorIcon = document.createElement("img");
          authorIcon.classList.add("notification-author-icon");
          authorIcon.src = subscription.subscription.avatar_src;
          authorIcon.alt = subscription.subscription.username;

          const usernameSpan = document.createElement("span");
          usernameSpan.classList.add("notification-author-username");
          usernameSpan.textContent = subscription.subscription.username;

          const contentSpan = document.createElement("span");
          contentSpan.classList.add("notification-content");
          contentSpan.textContent = notification.notification_type;
          switch (notification.notification_type) {
            case "new_article":
              contentSpan.textContent = "published a new article";
              break;
            case "new_comment":
              contentSpan.textContent = "wrote a comment on their article";
              break;
            case "new_subscriber":
              contentSpan.textContent = "subscribed to you";
              break;
            default:
              contentSpan.textContent = notification.notification_type;
          }

          const timestampSpan = document.createElement("span");
          timestampSpan.classList.add("notification-timestamp");
          timestampSpan.textContent = notification.date;

          notificationItem.appendChild(authorIcon);
          notificationItem.appendChild(usernameSpan);
          notificationItem.appendChild(contentSpan);
          notificationItem.appendChild(timestampSpan);

          notificationLink.appendChild(notificationItem);

          notificationLink.addEventListener("click", function () {
            fetch(`/notifications/${notification.id}/mark-as-read`, {
              method: 'PUT'
            })
              .then(response => {
                if (response.ok) {
                  // Update the local notification status and remove the 'unread' class
                  notification.read_status = true;
                  notificationItem.classList.remove("unread");

                  // Recalculate unreadCount and update badge visibility
                  const unreadCount = data.reduce((count, subscription) => {
                    const unreadNotifications = subscription.notifications.filter(
                      (notification) => !notification.read_status
                    );
                    return count + unreadNotifications.length;
                  }, 0);

                  if (unreadCount > 0) {
                    notificationBadge.style.display = "block";
                  } else {
                    notificationBadge.style.display = "none";
                  }
                } else {
                  console.error("Error updating notification status");
                }
              })
              .catch((error) => {
                console.error("Error updating notification:", error);
              });
          });

          notificationDropdown.appendChild(notificationLink);
        });
      });

      // If there are any unread notifications, show the badge
      const unreadCount = data.reduce((count, subscription) => {
        const unreadNotifications = subscription.notifications.filter(
          (notification) => !notification.read_status
        );
        return count + unreadNotifications.length;
      }, 0);

      if (unreadCount > 0) {
        notificationBadge.style.display = "block";
      } else {
        notificationBadge.style.display = "none";
      }
    })
    .catch((error) => {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
    });
}

getNotifications();
