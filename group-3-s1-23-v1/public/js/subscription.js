// Load this script on the subscription page
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn-subscription').forEach(button => {
        button.addEventListener('click', async event => {
            const authorId = event.target.getAttribute('data-author-id');

            try {
                const response = await fetch(`/unsubscribe/${authorId}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'success') {
                        location.reload();
                    }
                } else {
                    console.error(`Failed to unsubscribe from author ${authorId}`);
                }
            } catch (error) {
                console.error(`Error: ${error}`);
            }
        });
    });
});
