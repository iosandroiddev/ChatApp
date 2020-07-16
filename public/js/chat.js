const socket = io()

//Elements
const _messageForm = document.querySelector('#message-form')
const _messageFormInput = _messageForm.querySelector('input')
const _messageFormButton = _messageForm.querySelector('button')
const _sendLocationButton = document.querySelector('#send-location')
const _messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#message-location-template').innerHTML
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


const autoScroll = () => {
    // New Message Element
    const _newMessage = _messages.lastElementChild

    // Height of the New message
    const newMessageStyles = getComputedStyle(_newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = _newMessage.offsetHeight + newMessageMargin

    // Visible Height
    const visibleHeight = _messages.offsetHeight

    // Height of Messages Container
    const contentHeight = _messages.scrollHeight

    // How far have I Scrolled
    const scrollOffset = _messages.scrollTop + visibleHeight

    if (contentHeight - newMessageHeight <= scrollOffset) {
        _messages.scrollTop = _messages.scrollHeight
    }


}



socket.on('welcome-message', (message) => {
    const html = Mustache.render(messageTemplate, {
        userName: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('hh:mm a')

    })
    _messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        userName: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('hh:mm a')
    })
    _messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (locationObj) => {
    const html = Mustache.render(locationMessageTemplate, {
        userName: locationObj.username,
        url: locationObj.url,
        createdAt: moment(locationObj.createdAt).format('hh:mm a')
    })
    _messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})


socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sideBarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

_messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    _messageFormButton.setAttribute('disabled', 'disabled')
    const clientText = e.target.elements.message
    const clientMessage = clientText.value
    socket.emit('sendMessage', clientMessage, (error) => {
        _messageFormButton.removeAttribute('disabled')
        _messageFormInput.value = ''
        _messageFormInput.focus()
        if (error) {
            return console.log(error)
        }
        console.log('Message Delivered')
    })
})

_sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geo Location is not supported by your browser.')
    }

    _sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            lat: position.coords.latitude,
            long: position.coords.longitude
        }, () => {
            _sendLocationButton.removeAttribute('disabled')
            console.log('Location Shared!')
        })
    })
})


socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = "/"
    }
})