import re
import logging
from typing import Tuple
from urllib.parse import urlparse, urlunparse, parse_qs, urlencode

logger = logging.getLogger("CDNImageTransformer")

class CDNImageTransformer:
    """
    CDN High-Res URL Transformer
    Detects CDN providers and rewrites URL parameters to request the original full-resolution asset.
    """

    @staticmethod
    def transform(url: str, target_width: int = 1200, target_height: int = 1200) -> Tuple[str, str]:
        """
        Transforms compressed/thumbnail CDN URLs into high-resolution URLs.
        Returns a tuple: (transformed_high_res_url, cdn_provider_name)
        """
        if not url or not isinstance(url, str):
            return url, "Unknown"

        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        path = parsed.path
        query = parsed.query

        # 1. Cloudinary
        if "cloudinary.com" in domain or "/c_limit," in path or "/c_scale," in path or "/c_fit," in path or "/c_fill," in path:
            # Replace dimension transformations like /w_300,h_300/ or /c_limit,w_200/
            new_path = re.sub(r'/c_[a-z]+,[^/]+/', f'/c_limit,w_{target_width},h_{target_height},q_auto:best/', path)
            new_path = re.sub(r'/w_\d+,h_\d+[^/]*/', f'/w_{target_width},h_{target_height},q_auto:best/', new_path)
            new_path = re.sub(r'/w_\d+/', f'/w_{target_width}/', new_path)
            new_url = urlunparse((parsed.scheme, parsed.netloc, new_path, parsed.params, parsed.query, parsed.fragment))
            return new_url, "Cloudinary"

        # 2. ImageKit
        if "imagekit.io" in domain or "tr:" in path or "tr=" in query:
            # Transformation pattern in path /tr:w-200,h-200/
            if "tr:" in path:
                new_path = re.sub(r'/tr:[^/]+/', f'/tr:w-{target_width},h-{target_height},q-100/', path)
                new_url = urlunparse((parsed.scheme, parsed.netloc, new_path, parsed.params, parsed.query, parsed.fragment))
                return new_url, "ImageKit"
            if "tr=" in query:
                qs = parse_qs(query)
                qs['tr'] = [f'w-{target_width},h-{target_height},q-100']
                new_query = urlencode(qs, doseq=True)
                new_url = urlunparse((parsed.scheme, parsed.netloc, path, parsed.params, new_query, parsed.fragment))
                return new_url, "ImageKit"

        # 3. Blinkit / Grofers CDN (Cloudflare Image Resizing)
        if "cdn.grofers.com" in domain or "blinkit.com" in domain:
            # Strip Cloudflare resize prefix like /cdn-cgi/image/w=270,q=80/
            if "/cdn-cgi/image/" in path:
                new_path = re.sub(r'/cdn-cgi/image/[^/]+/', f'/cdn-cgi/image/w={target_width},q=95,f=auto/', path)
                new_url = urlunparse((parsed.scheme, parsed.netloc, new_path, parsed.params, parsed.query, parsed.fragment))
                return new_url, "Blinkit_CDN"
            # Strip query params like ?w=300&q=80
            if query:
                qs = parse_qs(query)
                qs['w'] = [str(target_width)]
                qs['q'] = ['95']
                new_query = urlencode(qs, doseq=True)
                return urlunparse((parsed.scheme, parsed.netloc, path, parsed.params, new_query, parsed.fragment)), "Blinkit_CDN"
            return url, "Blinkit_CDN"

        # 4. Zepto CDN
        if "zepto" in domain or "cdn.zeptowide.com" in domain or "zeptonow.com" in domain:
            # Pattern like /dim/200x200/ or /tr:w-300/
            new_path = re.sub(r'/dim/\d+x\d+/', f'/dim/{target_width}x{target_height}/', path)
            new_path = re.sub(r'/w-\d+/', f'/w-{target_width}/', new_path)
            # Remove query params
            return urlunparse((parsed.scheme, parsed.netloc, new_path, parsed.params, "", parsed.fragment)), "Zepto_CDN"

        # 5. Swiggy Instamart CDN (res.cloudinary.com or swiggy.com)
        if "swiggy.com" in domain or "instamart" in domain:
            if "/fl_lossy,f_auto,q_auto,w_" in path:
                new_path = re.sub(r'w_\d+', f'w_{target_width}', path)
                return urlunparse((parsed.scheme, parsed.netloc, new_path, parsed.params, parsed.query, parsed.fragment)), "Swiggy_CDN"
            if query:
                return urlunparse((parsed.scheme, parsed.netloc, path, parsed.params, "", parsed.fragment)), "Swiggy_CDN"

        # 6. Flipkart Minutes / Flipkart CDN
        if "flipkart.com" in domain or "rukminim1.flixcart.com" in domain or "rukminim2.flixcart.com" in domain:
            # Flipkart URLs contain dimension components like /image/128/128/ or /image/200/200/
            new_path = re.sub(r'/image/\d+/\d+/', f'/image/{target_width}/{target_height}/', path)
            new_path = re.sub(r'/(\d+)/(\d+)/image/', f'/{target_width}/{target_height}/image/', new_path)
            # Strip query params like ?q=70
            return urlunparse((parsed.scheme, parsed.netloc, new_path, parsed.params, "", parsed.fragment)), "Flipkart_CDN"

        # 7. Amazon Fresh / Amazon CDN (media-amazon.com or images-amazon.com)
        if "amazon" in domain or "media-amazon.com" in domain or "images-amazon.com" in domain or "ssl-images-amazon.com" in domain:
            # Amazon image modifier patterns like ._SX300_, ._AC_UL320_, ._SL1500_
            new_path = re.sub(r'\._[A-Z0-9_]{3,20}_\.', f'._SL{target_width}_.', path)
            new_path = re.sub(r'\._SX\d+_', f'._SL{target_width}_', new_path)
            new_path = re.sub(r'\._SY\d+_', f'._SL{target_height}_', new_path)
            return urlunparse((parsed.scheme, parsed.netloc, new_path, parsed.params, "", parsed.fragment)), "Amazon_CDN"

        # 8. Unsplash (Demo fallback CDNs)
        if "unsplash.com" in domain:
            qs = parse_qs(query)
            qs['w'] = [str(target_width)]
            qs['q'] = ['90']
            qs['fit'] = ['crop']
            new_query = urlencode(qs, doseq=True)
            return urlunparse((parsed.scheme, parsed.netloc, path, parsed.params, new_query, parsed.fragment)), "Unsplash_CDN"

        # Generic S3 / CDN fallback: Strip dynamic query parameters
        clean_url = urlunparse((parsed.scheme, parsed.netloc, path, parsed.params, "", parsed.fragment))
        # Replace thumbnail words like product_thumb.jpg -> product_large.jpg
        clean_url = re.sub(r'([_-])(thumb|small|mini|medium|200x200|300x300)(\.[a-z]{3,4})', r'\1large\3', clean_url, flags=re.IGNORECASE)
        return clean_url, "Generic_CDN"
