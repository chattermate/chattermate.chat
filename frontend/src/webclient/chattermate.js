;(function () {
  // Configuration object
  const config = {
    baseUrl: 'http://localhost:8000', // Replace with actual API URL
    containerId: 'chattermate-container',
    buttonId: 'chattermate-button',
    chatBubbleColor: '#f34611', // Default color
  }

  // Create and inject styles
  function updateStyles() {
    const style = document.createElement('style')
    style.id = 'chattermate-styles'
    style.textContent = `
      #${config.buttonId} {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 30px;
        background: ${config.chatBubbleColor};
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        z-index: 999999;
        transition: transform 0.3s ease;
      }

      #${config.buttonId}:hover {
        transform: scale(1.1);
      }

      #${config.containerId} {
        position: fixed;
        bottom: 100px;
        right: 20px;
        width: 400px;
        height: 600px;
        background: transparent;
        z-index: 999999;
        overflow: hidden;
        display: none;
        border: none;
        padding: 0;
        margin: 0;
      }

      #${config.containerId}.active {
        display: block;
      }

      .chattermate-iframe {
        width: 100%;
        height: 100%;
        border: none;
        padding: 0;
        margin: 0;
        display: block;
        border-radius: 24px;
      }

      @media (max-width: 768px) {
        #${config.containerId} {
          width: 100%;
          height: 100vh;
          bottom: 0;
          right: 0;
          border-radius: 0;
        }

        .chattermate-iframe {
          border-radius: 0;
        }

        #${config.buttonId} {
          bottom: 40px;
        }
      }
    `
    // Remove existing style if it exists
    const existingStyle = document.getElementById('chattermate-styles')
    if (existingStyle) {
      existingStyle.remove()
    }
    document.head.appendChild(style)
  }

  updateStyles()

  // Create chat button with icon
  const button = document.createElement('div')
  button.id = config.buttonId
  button.innerHTML = `
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M45 15H15C13.3431 15 12 16.3431 12 18V42C12 43.6569 13.3431 45 15 45H25L30 52L35 45H45C46.6569 45 48 43.6569 48 42V18C48 16.3431 46.6569 15 45 15Z" fill="white"/>
      <path d="M36 27C36 27 32.5 26 30 26C27.5 26 24 27 24 31C24 35 27.5 36 30 36C32.5 36 36 35 36 35V33C36 33 33 34 31.5 34C30 34 27 33 27 31C27 29 30 28 31.5 28C33 28 36 29 36 29V27Z" fill="${config.chatBubbleColor}"/>
    </svg>
  `

  // Create chat container
  const container = document.createElement('div')
  container.id = config.containerId

  // Add elements to document
  document.body.appendChild(button)
  document.body.appendChild(container)

  // Initialize chat widget
  let isOpen = false
  let iframe = null

  function toggleChat() {
    isOpen = !isOpen
    container.classList.toggle('active')

    if (isOpen && !iframe) {
      iframe = document.createElement('iframe')
      iframe.className = 'chattermate-iframe'
      iframe.src = `${config.baseUrl}/api/v1/widgets/${window.chattermateId}/data?widget_id=${window.chattermateId}`
      container.appendChild(iframe)
    }

    // Add message to trigger scroll
    if (isOpen && iframe) {
      iframe.contentWindow.postMessage({ type: 'SCROLL_TO_BOTTOM' }, '*')
    }
  }
  if (!iframe) {
    iframe = document.createElement('iframe')
    iframe.className = 'chattermate-iframe'
    iframe.src = `${config.baseUrl}/api/v1/widgets/${window.chattermateId}/data?widget_id=${window.chattermateId}`
    container.appendChild(iframe)
  }

  // Add click event listener
  button.addEventListener('click', toggleChat)

  // Add message listener for customization updates
  window.addEventListener('message', function (event) {
    if (event.data.type === 'CUSTOMIZATION_UPDATE') {
      config.chatBubbleColor = event.data.data.chat_bubble_color
      updateStyles()
      // Update the SVG fill color
      const svgPath = button.querySelector('svg path:last-child')
      if (svgPath) {
        svgPath.setAttribute('fill', config.chatBubbleColor)
      }
    }
  })

  // Expose global configuration function
  window.ChatterMate = {
    init: function (options) {
      if (options.baseUrl) {
        config.baseUrl = options.baseUrl
      }
      window.chattermateId = options.id
    },
  }
})()
