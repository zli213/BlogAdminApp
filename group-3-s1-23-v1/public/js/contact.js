const contactUsBtn = selectElement('#contactUsBtn')
const contactInputName = selectElement('#contactInputName')
const contactInputEmail = selectElement('#contactInputEmail')

contactInputName.addEventListener('change', () => {
    if (contactInputName.value != '' && contactInputEmail.value != '' && contactInputEmail.value.includes('@')) {
        addClickToComingSoon()
    }
})

contactInputEmail.addEventListener('change', () => {
    if (contactInputName.value != '' && contactInputEmail.value != '' && contactInputEmail.value.includes('@')) {
        addClickToComingSoon()
    }
})

function addClickToComingSoon() {
    contactUsBtn.addEventListener('click', (e) => {
        e.preventDefault()
        window.location.href = '/comingsoon'
    })
}