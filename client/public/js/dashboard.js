// === Updated dashboard.js ===
$(document).ready(function () {
  // Function to dynamically load partial content into #main-content
  function loadPartial(url) {
    $('#main-content').html('<p>Loading...</p>'); // Show loading message
    $.ajax({
      type: 'GET',
      url: url,
      success: function (responseHtml) {
        $('#main-content').html(responseHtml);
      },
      error: function (err) {
        console.error('Error:', err);
        $('#main-content').html('<p>Failed to load content. Please try again.</p>');
      }
    });
  }

  // Default: load Crop Recommendation on page load
  loadPartial('/crop/partial');

  // Handle nav link clicks
  $('.nav-boxes a').on('click', function (e) {
    const href = $(this).attr('href');

    // Exclude "Home" and "Logout" from being handled by loadPartial
    if (href === '/dashboard' || href === '/logout') {
      return; // Allow default navigation for these links
    }

    // Adjust logic to handle other links dynamically
    if (href && href.startsWith('/')) {
      e.preventDefault();
      loadPartial(href + '/partial');
    }
  });

  // Handle tab button clicks
  $(document).on('click', '.tab-nav button', function () {
    const url = $(this).data('url');
    if (url) {
      console.log('Loading partial for:', url); // Debugging log
      loadPartial(url);
    } else {
      console.warn('No URL found for button'); // Debugging log
    }
  });

  // Delegate crop form submission
  $(document).on('submit', '#crop-form', function (e) {
    e.preventDefault(); // Prevent default form submission

    const pH_Value = $('#pH_Value').val();
    const Rainfall = $('#Rainfall').val();
    const Temperature = $('#Temperature').val();
    const Humidity = $('#Humidity').val();

    if (!pH_Value || !Rainfall || !Temperature || !Humidity) {
      alert('Please fill in all the fields.');
      return;
    }

    const formData = { pH_Value, Rainfall, Temperature, Humidity };

    $.ajax({
      type: 'POST',
      url: '/recommend-crop',
      data: JSON.stringify(formData),
      contentType: 'application/json',
      success: function (responseHtml) {
        // Update only the #result section
        $('#result').html(responseHtml);
      },
      error: function (err) {
        console.error('Error:', err);
        $('#result').html('<p>Failed to get recommendation. Please try again.</p>');
      }
    });
  });

  // Delegate weather form submission
  $(document).on('submit', '#weather-form', function (e) {
    e.preventDefault(); // Prevent default form submission

    const city = $('#city').val();
    if (!city) {
      alert('Please enter a city name.');
      return;
    }

    $.ajax({
      type: 'POST',
      url: '/weather',
      data: JSON.stringify({ city }),
      contentType: 'application/json',
      success: function (responseHtml) {
        // Update only the #weather-result section
        $('#weather-result').html(responseHtml);
      },
      error: function (err) {
        console.error('Error:', err);
        $('#weather-result').html('<p>Failed to load weather data. Try again.</p>');
      }
    });
  });

  // Delegate disease form submission
  $(document).on('submit', '#disease-form', function (e) {
    e.preventDefault(); // Prevent default form submission

    const formData = new FormData(this);

    $.ajax({
      type: 'POST',
      url: '/upload-image',
      data: formData,
      processData: false,
      contentType: false,
      success: function (responseHtml) {
      // Update only the #result section
        $('#result').html(responseHtml);
      },
      error: function (err) {
        console.error('Error:', err);
        $('#result').html('<p>Failed to detect disease. Try again.</p>');
      }
    });
  });
});
