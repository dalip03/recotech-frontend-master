import { fetchParts } from "@/api/partsService";
import { Card } from "@/components/ui";
import wrapPromise from "@/utils/wrapPromise";
import { t } from "i18next";

type Statistics = {
    totalParts: number;
    totalQuantityParts: number,

};
const fetchStatistics = () => {
    return new Promise<Statistics>((resolve) => {
        Promise.all([
            fetchParts(),
        ]).then(([parts]) => resolve({
            totalParts: parts.length,
            totalQuantityParts: parts.reduce((total: any, part: any) => total + part.quantity, 0),
        }))
    });
};

const partsResource = wrapPromise(fetchStatistics()); // Create the resource for statistics

export default function Parts() {
    const parts = partsResource.read(); // This will suspend until data is fetched

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mt-2">
            <Card
                clickable
                className="hover:shadow-lg transition duration-150 ease-in-out rounded-2xl"
            >
                <h5 className="text-4xl font-bold"># {t("Part Types")}</h5>
                <p className="mt-10 text-4xl font-bold">{parts.totalParts !== null ? parts.totalParts : 'N/A'}</p>
            </Card>
            <Card
                clickable
                className="hover:shadow-lg transition duration-150 ease-in-out rounded-2xl"
            >
                <h5 className="text-4xl font-bold"># {t("Total Parts")}</h5>
                <p className="mt-10 text-4xl font-bold">{parts.totalQuantityParts !== null ? parts.totalQuantityParts : 'N/A'}</p>
            </Card>
        </div>
    );
}