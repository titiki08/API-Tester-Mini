using System.Collections.Generic;

namespace ApiTesterMini.Models
{
    public class ApiRequest
    {
        public string Method { get; set; } = "GET";
        public string Url { get; set; } = string.Empty;
        public List<KeyValuePair<string, string>> Headers { get; set; } = new List<KeyValuePair<string, string>>();
        public string Body { get; set; } = string.Empty;
    }
}
