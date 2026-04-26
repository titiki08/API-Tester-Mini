using System.Collections.Generic;

namespace ApiTesterMini.Models
{
    public class ApiResponse
    {
        public int StatusCode { get; set; }

        public string StatusDescription { get; set; } = string.Empty;

        public long TimeMs { get; set; }

        public long SizeBytes { get; set; }
        
        public string ContentType { get; set; } = string.Empty;

        public string Body { get; set; } = string.Empty;

        public List<KeyValuePair<string, string>> Headers { get; set; } = new List<KeyValuePair<string, string>>();
        
        public bool IsSuccess { get; set; }

        public string ErrorMessage { get; set; } = string.Empty;
    }
}
