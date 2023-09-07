document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners to subscribe buttons and set initial color
    document.querySelectorAll('.subscribe_button').forEach(button => {
        button.addEventListener('click', handleClickSubscribeButton);

        // Set initial color
        if (button.innerText === 'unsubscribe') {
            button.style.backgroundColor = '#748ce4';
        } else {
            button.style.backgroundColor = '#ff7383';
        }
    });
});

async function handleClickSubscribeButton(event) {
    //url will depends on the button stauts,if the button is subscribe,then the url will be subscribe,if the button is unsubscribe,then the url will be unsubscribe
    const subscriberId = event.target.getAttribute('data-subscriber-id');
    let isSubscribed = event.target.innerText === 'unsubscribe';
    const url = isSubscribed ? `/unsubscribe/${subscriberId}` : `/dosubscribe/${subscriberId}`;
    const response = await fetch(url, { method: 'GET' });
    if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
            // Update isSubscribed to reflect the new subscription status.
            isSubscribed = data.subscribed;
            event.target.innerText = isSubscribed ? 'unsubscribe' : 'subscribe';
            event.target.style.backgroundColor = isSubscribed ? '#748ce4' : '#ff7383';
            location.reload();

        } else {
            console.error(`Failed to ${isSubscribed ? 'unsubscribe from' : 'subscribe to'} author ${subscriberId}, reason: ${data.message}`);
        }
    } else {
        console.error(`Failed to ${isSubscribed ? 'unsubscribe from' : 'subscribe to'} author ${subscriberId}`);
    }
}


