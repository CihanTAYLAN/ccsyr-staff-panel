// User-Agent bilgisinden tarayıcı, işletim sistemi ve cihaz bilgilerini çıkaran yardımcı fonksiyon

interface UserAgentDetails {
	browser: string;
	os: string;
	device: string;
}

export function getUserAgentDetails(userAgent: string): UserAgentDetails {
	// Varsayılan değerler
	const details: UserAgentDetails = {
		browser: "Unknown",
		os: "Unknown",
		device: "Unknown",
	};

	if (!userAgent) {
		return details;
	}

	// İşletim sistemi tespiti
	if (userAgent.includes("Windows")) {
		details.os = "Windows";
	} else if (userAgent.includes("Mac OS")) {
		details.os = "macOS";
	} else if (userAgent.includes("Android")) {
		details.os = "Android";
	} else if (userAgent.includes("iOS") || userAgent.includes("iPhone") || userAgent.includes("iPad")) {
		details.os = "iOS";
	} else if (userAgent.includes("Linux")) {
		details.os = "Linux";
	}

	// Tarayıcı tespiti
	if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
		details.browser = "Chrome";
	} else if (userAgent.includes("Firefox")) {
		details.browser = "Firefox";
	} else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
		details.browser = "Safari";
	} else if (userAgent.includes("Edg")) {
		details.browser = "Edge";
	} else if (userAgent.includes("OPR") || userAgent.includes("Opera")) {
		details.browser = "Opera";
	} else if (userAgent.includes("MSIE") || userAgent.includes("Trident/")) {
		details.browser = "Internet Explorer";
	}

	// Cihaz tespiti
	if (userAgent.includes("Mobile")) {
		details.device = "Mobile";
	} else if (userAgent.includes("Tablet")) {
		details.device = "Tablet";
	} else if (userAgent.includes("iPad")) {
		details.device = "Tablet";
	} else if (userAgent.includes("iPhone")) {
		details.device = "Mobile";
	} else if (userAgent.includes("Android") && userAgent.includes("Mobile")) {
		details.device = "Mobile";
	} else if (userAgent.includes("Android") && !userAgent.includes("Mobile")) {
		details.device = "Tablet";
	} else {
		details.device = "Desktop";
	}

	return details;
}
