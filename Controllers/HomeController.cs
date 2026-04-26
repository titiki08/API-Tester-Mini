using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Linq;
using ApiTesterMini.Models;
using System;

namespace ApiTesterMini.Controllers
{
    public class HomeController : Controller
    {
        private readonly IHttpClientFactory _clientFactory;

        public HomeController(IHttpClientFactory clientFactory)
        {
            _clientFactory = clientFactory;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> SendRequest([FromBody] ApiRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Url))
            {
                return BadRequest("URL is required.");
            }

            var responseResult = new ApiResponse();
            var stopwatch = Stopwatch.StartNew();

            try
            {
                var client = _clientFactory.CreateClient();
                var httpRequest = new HttpRequestMessage(new HttpMethod(request.Method), request.Url);

                // Add Headers
                if (request.Headers != null)
                {
                    foreach (var header in request.Headers)
                    {
                        if (!string.IsNullOrWhiteSpace(header.Key))
                        {
                            // Some headers must be added to content instead of request message directly
                            httpRequest.Headers.TryAddWithoutValidation(header.Key, header.Value);
                        }
                    }
                }

                // Add Body if applicable
                if ((request.Method.Equals("POST", StringComparison.OrdinalIgnoreCase) || 
                     request.Method.Equals("PUT", StringComparison.OrdinalIgnoreCase) ||
                     request.Method.Equals("PATCH", StringComparison.OrdinalIgnoreCase)) && 
                     !string.IsNullOrWhiteSpace(request.Body))
                {
                    // By default, assuming JSON. 
                    // To handle dynamic content type, we can check headers.
                    var contentType = request.Headers?.FirstOrDefault(h => h.Key.Equals("Content-Type", StringComparison.OrdinalIgnoreCase)).Value ?? "application/json";
                    httpRequest.Content = new StringContent(request.Body, Encoding.UTF8, contentType);
                }

                var httpResponse = await client.SendAsync(httpRequest);
                stopwatch.Stop();

                responseResult.TimeMs = stopwatch.ElapsedMilliseconds;
                responseResult.StatusCode = (int)httpResponse.StatusCode;
                responseResult.StatusDescription = httpResponse.StatusCode.ToString();
                responseResult.IsSuccess = httpResponse.IsSuccessStatusCode;

                // Read headers
                foreach (var header in httpResponse.Headers)
                {
                    responseResult.Headers.Add(new KeyValuePair<string, string>(header.Key, string.Join(", ", header.Value)));
                }
                if (httpResponse.Content?.Headers != null)
                {
                    foreach (var header in httpResponse.Content.Headers)
                    {
                        responseResult.Headers.Add(new KeyValuePair<string, string>(header.Key, string.Join(", ", header.Value)));
                    }
                }

                // Read Body
                if (httpResponse.Content != null)
                {
                    var contentBytes = await httpResponse.Content.ReadAsByteArrayAsync();
                    responseResult.SizeBytes = contentBytes.Length;
                    
                    var contentType = httpResponse.Content.Headers.ContentType?.MediaType;
                    responseResult.ContentType = contentType ?? "";

                    if (contentType != null && contentType.StartsWith("image/"))
                    {
                        responseResult.Body = Convert.ToBase64String(contentBytes);
                    }
                    else
                    {
                        responseResult.Body = Encoding.UTF8.GetString(contentBytes);
                    }
                }
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                responseResult.TimeMs = stopwatch.ElapsedMilliseconds;
                responseResult.IsSuccess = false;
                responseResult.ErrorMessage = ex.Message;
            }

            return Json(responseResult);
        }
    }
}
