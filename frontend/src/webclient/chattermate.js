// TypeScript declarations for global variables
/** @type {string} */
window.chattermateId;
/** @type {{ init: (options: { baseUrl?: string, id: string }) => void }} */
window.ChatterMate;

;(function () {
  // Function to validate hex color code
  function isValidHexColor(color) {
    return /^#[0-9A-F]{6}$/i.test(color);
  }

  // Configuration object
  const config = {
    baseUrl: 'http://localhost:8000', // Replace with actual API URL
    containerId: 'chattermate-container',
    buttonId: 'chattermate-button',
    chatBubbleColor: '#f34611', // Default color
    loadingContainerId: 'chattermate-loading',
    tokenKey: 'ctid' // Key for localStorage
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

      #${config.buttonId}.loading {
        position: relative;
      }

      #${config.buttonId}.loading:after {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        top: 50%;
        left: 50%;
        margin: -8px 0 0 -8px;
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        border-top-color: #fff;
        animation: chattermate-spin 0.6s linear infinite;
      }

      @keyframes chattermate-spin {
        to {transform: rotate(360deg);}
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

  // Get stored token
  function getStoredToken() {
    return localStorage.getItem(config.tokenKey);
  }

  // Save token
  function saveToken(token) {
    if (token) {
      localStorage.setItem(config.tokenKey, token);
    }
  }

  // Remove token
  function removeToken() {
    localStorage.removeItem(config.tokenKey);
  }

  // Initialize function to create and append elements
  function initialize() {
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

    let isOpen = false
    let iframe = null
    let isLoading = false

    // Start prefetching the widget data
    async function prefetchWidget() {
      if (isLoading || iframe) return
      
      try {
        isLoading = true
        button.classList.add('loading')
        
        const token = getStoredToken();
        
        iframe = document.createElement('iframe')
        iframe.className = 'chattermate-iframe'
        
        // Fetch widget data with Authorization header if token exists
        const url = `${config.baseUrl}/api/v1/widgets/${window.chattermateId}/data?widget_id=${window.chattermateId}`;
        const options = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
        
        fetch(url, options)
          .then(response => response.text())
          .then(html => {
            iframe.srcdoc = html;
            container.appendChild(iframe)
            button.classList.remove('loading')
            iframe.style.opacity = '1'
          })
          .catch(error => {
            console.error('Failed to load widget:', error)
            button.classList.remove('loading')
          });

        // Listen for token updates from iframe
        window.addEventListener('message', function(event) {
          if (event.data.type === 'TOKEN_UPDATE') {
            saveToken(event.data.token);
            // Confirm token storage to iframe
            iframe.contentWindow.postMessage({ 
              type: 'TOKEN_RECEIVED', 
              token: event.data.token 
            }, '*');
          }
        });

      } catch (error) {
        console.error('Failed to load widget:', error)
        button.classList.remove('loading')
      } finally {
        isLoading = false
      }
    }

    // Start prefetching immediately
    prefetchWidget()

    function toggleChat() {
      isOpen = !isOpen
      container.classList.toggle('active')

      if (isOpen && iframe) {
        iframe.contentWindow.postMessage({ type: 'SCROLL_TO_BOTTOM' }, '*')
      }
    }

    // Add click event listener
    button.addEventListener('click', toggleChat)
  }

  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize)
  } else {
    initialize()
  }

  // Add message listener for customization updates
  window.addEventListener('message', function (event) {
    if (event.data.type === 'CUSTOMIZATION_UPDATE') {
      const newColor = event.data.data.chat_bubble_color;
      config.chatBubbleColor = isValidHexColor(newColor) ? newColor : config.chatBubbleColor;
      updateStyles()
      // Update the SVG fill color
      const svgPath = document.querySelector(`#${config.buttonId} svg path:last-child`)
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
