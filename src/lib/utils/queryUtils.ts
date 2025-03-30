import { Prisma } from "@prisma/client";

type PaginationParams = {
	page: number;
	pageSize: number;
};

type SortingParams = {
	sortField: string;
	sortOrder: "asc" | "desc";
};

type SearchParams = {
	search?: string;
	searchFields?: string[];
};

/**
 * Sayfalama için skip ve take değerlerini hesaplar
 */
export const getPaginationValues = ({ page, pageSize }: PaginationParams) => {
	const skip = (page - 1) * pageSize;
	return { skip, take: pageSize };
};

/**
 * Sayfalama meta bilgilerini hesaplar
 */
export const calculatePaginationMeta = (total: number, { page, pageSize }: PaginationParams) => {
	const totalPages = Math.ceil(total / pageSize);
	const hasNext = page < totalPages;
	const hasPrevious = page > 1;

	return {
		page,
		pageSize,
		total,
		totalPages,
		hasNext,
		hasPrevious,
	};
};

/**
 * Sıralama için Prisma query oluşturur
 * Örnek: sortField = "name", sortOrder = "asc" => { name: "asc" }
 * Örnek: sortField = "currentLocation.name", sortOrder = "desc" => { currentLocation: { name: "desc" } }
 */
export const parseSortingToQuery = ({ sortField, sortOrder }: SortingParams): any => {
	if (!sortField) {
		return { created_at: sortOrder || "desc" };
	}

	// Nested field handling (e.g., "currentLocation.name")
	if (sortField.includes(".")) {
		const [parent, ...children] = sortField.split(".");
		const childrenField = children.join(".");

		return {
			[parent]: parseSortingToQuery({
				sortField: childrenField,
				sortOrder: sortOrder,
			}),
		};
	}

	return { [sortField]: sortOrder };
};

/**
 * Arama için Prisma where koşulu oluşturur
 */
export const createSearchQuery = ({ search, searchFields = [] }: SearchParams) => {
	if (!search) return {};

	const OR = searchFields.map((field) => ({
		[field]: { contains: search, mode: "insensitive" as Prisma.QueryMode },
	}));

	return { OR };
};

/**
 * URL parametre string'inden sayısal değer elde eder
 */
export const parseNumericParam = (param: string | null, defaultValue: number): number => {
	if (!param) return defaultValue;
	const parsed = parseInt(param);
	return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Request'ten sayfalama, sıralama ve arama parametrelerini alır
 */
export const extractRequestParams = (searchParams: URLSearchParams) => {
	const page = parseNumericParam(searchParams.get("page"), 1);
	const pageSize = parseNumericParam(searchParams.get("pageSize"), 10);
	const search = searchParams.get("search") || "";
	const sortField = searchParams.get("sortField") || "created_at";
	const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

	return {
		page,
		pageSize,
		search,
		sortField,
		sortOrder,
	};
};
