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

	// İşletim sistemi tespiti - daha detaylı versiyonları da içerir
	if (userAgent.includes("Windows NT 10.0")) {
		details.os = "Windows 10";
	} else if (userAgent.includes("Windows NT 6.3")) {
		details.os = "Windows 8.1";
	} else if (userAgent.includes("Windows NT 6.2")) {
		details.os = "Windows 8";
	} else if (userAgent.includes("Windows NT 6.1")) {
		details.os = "Windows 7";
	} else if (userAgent.includes("Windows NT 6.0")) {
		details.os = "Windows Vista";
	} else if (userAgent.includes("Windows NT 5.1")) {
		details.os = "Windows XP";
	} else if (userAgent.includes("Windows")) {
		details.os = "Windows";
	} else if (userAgent.includes("Mac OS X")) {
		// Mac OS X versiyonunu tespit etmeye çalış
		const macOSVersionMatch = userAgent.match(/Mac OS X (\d+[._]\d+[._]?\d*)/);
		if (macOSVersionMatch && macOSVersionMatch[1]) {
			// Nokta ve alt çizgileri noktaya dönüştür
			const version = macOSVersionMatch[1].replace(/_/g, ".");
			details.os = `macOS ${version}`;
		} else {
			details.os = "macOS";
		}
	} else if (userAgent.includes("Android")) {
		// Android versiyonunu tespit etmeye çalış
		const versionMatch = userAgent.match(/Android\s([0-9.]+)/);
		details.os = versionMatch ? `Android ${versionMatch[1]}` : "Android";
	} else if (userAgent.includes("iPhone OS") || userAgent.includes("iPad OS") || userAgent.includes("iPod OS")) {
		// iOS versiyonunu tespit etmeye çalış
		const versionMatch = userAgent.match(/OS\s([0-9_]+)/);
		if (versionMatch && versionMatch[1]) {
			const iosVersion = versionMatch[1].replace(/_/g, ".");
			details.os = `iOS ${iosVersion}`;
		} else {
			details.os = "iOS";
		}
	} else if (userAgent.includes("Linux")) {
		if (userAgent.includes("Ubuntu")) {
			details.os = "Ubuntu Linux";
		} else if (userAgent.includes("Fedora")) {
			details.os = "Fedora Linux";
		} else if (userAgent.includes("Debian")) {
			details.os = "Debian Linux";
		} else {
			details.os = "Linux";
		}
	}

	// Tarayıcı tespiti - daha detaylı versiyonları içerir
	if (userAgent.includes("Chrome") && !userAgent.includes("Edg") && !userAgent.includes("OPR")) {
		const versionMatch = userAgent.match(/Chrome\/([0-9.]+)/);
		details.browser = versionMatch ? `Chrome ${versionMatch[1]}` : "Chrome";
	} else if (userAgent.includes("Firefox")) {
		const versionMatch = userAgent.match(/Firefox\/([0-9.]+)/);
		details.browser = versionMatch ? `Firefox ${versionMatch[1]}` : "Firefox";
	} else if (userAgent.includes("Safari") && !userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
		const versionMatch = userAgent.match(/Safari\/([0-9.]+)/);
		details.browser = versionMatch ? `Safari ${versionMatch[1]}` : "Safari";
	} else if (userAgent.includes("Edg")) {
		const versionMatch = userAgent.match(/Edg\/([0-9.]+)/);
		details.browser = versionMatch ? `Edge ${versionMatch[1]}` : "Edge";
	} else if (userAgent.includes("OPR") || userAgent.includes("Opera")) {
		const versionMatch = userAgent.match(/OPR\/([0-9.]+)/);
		details.browser = versionMatch ? `Opera ${versionMatch[1]}` : "Opera";
	} else if (userAgent.includes("MSIE") || userAgent.includes("Trident/")) {
		const versionMatch = userAgent.match(/MSIE\s([0-9.]+)/);
		details.browser = versionMatch ? `Internet Explorer ${versionMatch[1]}` : "Internet Explorer";
	}

	// Daha detaylı cihaz tespiti
	if (userAgent.includes("iPhone")) {
		details.device = "iPhone";
	} else if (userAgent.includes("iPad")) {
		details.device = "iPad";
	} else if (userAgent.includes("iPod")) {
		details.device = "iPod";
	} else if (userAgent.includes("Android") && userAgent.includes("Mobile")) {
		details.device = "Android Phone";
	} else if (userAgent.includes("Android") && !userAgent.includes("Mobile")) {
		details.device = "Android Tablet";
	} else if (userAgent.includes("Windows Phone")) {
		details.device = "Windows Phone";
	} else if (userAgent.includes("Mobile") || userAgent.includes("Android")) {
		details.device = "Mobile";
	} else if (userAgent.includes("Tablet")) {
		details.device = "Tablet";
	} else {
		// Masaüstü platformu tespiti
		if (userAgent.includes("Windows")) {
			details.device = "Windows Desktop";
		} else if (userAgent.includes("Macintosh") || userAgent.includes("Mac OS")) {
			details.device = "Mac Desktop";
		} else if (userAgent.includes("Linux")) {
			details.device = "Linux Desktop";
		} else {
			details.device = "Desktop";
		}
	}

	return details;
}
