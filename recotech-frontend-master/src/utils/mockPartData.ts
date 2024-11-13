export const mockData = [
    {
        id: 1,
        name: 'Motor',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2018,
        chassy: 'Sedan',
        fuel: 'Benzină',
        engineType: '2ZR-FE',
        kw: 100, // Updated to a valid kw value
        engineCode: '2ZR-FE',
        quantity: 15,
        quality: 'Nou', // Updated quality
        color: 'Negru',
        supplier: 'Furnizor Piese Toyota',
        halaZona: 'Hala 3',
        rastel: 'Rastel A',
        etaj: 2,
        raft: 5,
        po: 3000, // Preț estimat
        internalObservations: 'Fără probleme, piesa este în stare bună',
        publicObservations: 'Disponibilă pentru achiziție imediată',
        partCode: [67847, 98542, 12458],
        isDisplayableAutovit: true,
        isUkCar: false,
        requiresRecondition: false
    },
    {
        id: 2,
        name: 'Cutie de viteze',
        brand: 'Ford',
        model: 'Focus',
        year: 2019,
        chassy: 'Hatchback',
        fuel: 'Motorină',
        engineType: 'TDCi 2.0',
        kw: 75, // Updated to a valid kw value
        engineCode: 'TDCi 2.0',
        quantity: 8,
        quality: 'Utilizat', // Updated quality
        color: 'Argintiu',
        supplier: 'Furnizor Piese Ford',
        halaZona: 'Hala 1',
        rastel: 'Rastel B',
        etaj: 1,
        raft: 3,
        po: 2000, // Preț estimat
        internalObservations: 'Uzură ușoară, încă funcțional',
        publicObservations: 'Cutie de viteze second-hand',
        partCode: [67847, 55874, 45896],
        isDisplayableAutovit: true,
        isUkCar: false,
        requiresRecondition: false
    },
    {
        id: 3,
        name: 'Turbocompresor',
        brand: 'Audi',
        model: 'A4',
        year: 2017,
        chassy: 'Sedan',
        fuel: 'Motorină',
        engineType: 'CRL TDI',
        kw: 150, // Updated to a valid kw value
        engineCode: 'CRL TDI',
        quantity: 5,
        quality: 'Nou', // Updated quality
        color: 'Gri',
        supplier: 'Depozit Piese Audi',
        halaZona: 'Hala 2',
        rastel: 'Rastel C',
        etaj: 1,
        raft: 2,
        po: 2500, // Preț estimat
        internalObservations: 'Stare excelentă',
        publicObservations: 'Turbocompresor cu utilizare minimă',
        partCode: [23456, 67847, 78412],
        isDisplayableAutovit: true,
        isUkCar: false,
        requiresRecondition: false
    },
    {
        id: 4,
        name: 'Alternator',
        brand: 'BMW',
        model: '320d',
        year: 2016,
        chassy: 'Sedan',
        fuel: 'Motorină',
        engineType: 'B47D20',
        kw: 100, // Updated to a valid kw value
        engineCode: 'B47D20',
        quantity: 12,
        quality: 'Nou', // Updated quality
        color: 'Negru',
        supplier: 'Furnizor Piese BMW',
        halaZona: 'Hala 4',
        rastel: 'Rastel D',
        etaj: 3,
        raft: 6,
        po: 1200, // Preț estimat
        internalObservations: 'Fără semne de uzură',
        publicObservations: 'În condiții perfecte de funcționare',
        partCode: [67847, 35421, 25689],
        isDisplayableAutovit: true,
        isUkCar: false,
        requiresRecondition: false
    },
    {
        id: 5,
        name: 'Radiator',
        brand: 'Mercedes-Benz',
        model: 'C-Class',
        year: 2015,
        chassy: 'Coupe',
        fuel: 'Benzină',
        engineType: 'M274',
        kw: 75, // Updated to a valid kw value
        engineCode: 'M274',
        quantity: 7,
        quality: 'Utilizat', // Updated quality
        color: 'Argintiu',
        supplier: 'Depozit Piese Mercedes',
        halaZona: 'Hala 1',
        rastel: 'Rastel E',
        etaj: 2,
        raft: 1,
        po: 900, // Preț estimat
        internalObservations: 'Uzură minoră',
        publicObservations: 'Funcționează bine, dar cu unele daune cosmetice',
        partCode: [67847, 78456, 98456],
        isDisplayableAutovit: true,
        isUkCar: false,
        requiresRecondition: false
    },
    {
        id: 6,
        name: 'Conductă de evacuare',
        brand: 'Volkswagen',
        model: 'Golf',
        year: 2016,
        chassy: 'Hatchback',
        fuel: 'Benzină',
        engineType: 'EA211',
        kw: 50, // Updated to a valid kw value
        engineCode: 'EA211',
        quantity: 20,
        quality: 'Nou', // Updated quality
        color: 'Metalizat',
        supplier: 'Furnizor Piese VW',
        halaZona: 'Hala 5',
        rastel: 'Rastel F',
        etaj: 1,
        raft: 4,
        po: 1800, // Preț estimat
        internalObservations: 'Stare perfectă',
        publicObservations: 'Nedotată și gata pentru instalare',
        partCode: [27845, 67847, 45612],
        isDisplayableAutovit: true,
        isUkCar: false,
        requiresRecondition: false
    },
    {
        id: 7,
        name: 'Caliper de frână',
        brand: 'Honda',
        model: 'Civic',
        year: 2019,
        chassy: 'Sedan',
        fuel: 'Benzină',
        engineType: 'L15B7',
        kw: 150, // Updated to a valid kw value
        engineCode: 'L15B7',
        quantity: 3,
        quality: 'Avariat', // Updated quality
        color: 'Roșu',
        supplier: 'Depozit Piese Honda',
        halaZona: 'Hala 6',
        rastel: 'Rastel G',
        etaj: 2,
        raft: 3,
        po: 400, // Preț estimat
        internalObservations: 'Unele rugină pe suprafață',
        publicObservations: 'Funcțional, dar necesită curățare',
        partCode: [13579, 67847, 98745],
        isDisplayableAutovit: true,
        isUkCar: true, // Această piesă provine dintr-o mașină din Marea Britanie
        requiresRecondition: true
    }
];

export const mockOptions = {
    brand: [
        { value: 'Ford', label: 'Ford' },
        { value: 'BMW', label: 'BMW' },
        { value: 'Audi', label: 'Audi' },
        { value: 'Toyota', label: 'Toyota' },
        { value: 'Mercedes-Benz', label: 'Mercedes-Benz' },
        { value: 'Volkswagen', label: 'Volkswagen' },
        { value: 'Honda', label: 'Honda' }
    ],
    model: [
        { value: 'Focus', label: 'Focus' },
        { value: 'Corolla', label: 'Corolla' },
        { value: 'X5', label: 'X5' },
        { value: 'A4', label: 'A4' },
        { value: 'Camry', label: 'Camry' },
        { value: '320d', label: '320d' },
        { value: 'C-Class', label: 'C-Class' },
        { value: 'Golf', label: 'Golf' },
        { value: 'Civic', label: 'Civic' }
    ],
    year: [
        { value: 2024, label: 2024 },
        { value: 2023, label: 2023 },
        { value: 2022, label: 2022 },
        { value: 2021, label: 2021 },
        { value: 2020, label: 2020 },
        { value: 2019, label: 2019 },
        { value: 2018, label: 2018 },
        { value: 2017, label: 2017 },
        { value: 2016, label: 2016 },
        { value: 2015, label: 2015 }
    ],
    chassy: [
        { value: 'Sedan', label: 'Sedan' },
        { value: 'Hatchback', label: 'Hatchback' },
        { value: 'SUV', label: 'SUV' },
        { value: 'Coupé', label: 'Coupé' }
    ],
    fuel: [
        { value: 'Benzină', label: 'Benzină' },
        { value: 'Motorină', label: 'Motorină' },
        { value: 'Electric', label: 'Electric' },
        { value: 'Hibrid', label: 'Hibrid' }
    ],
    engineType: [
        { value: '2ZR-FE', label: '2ZR-FE' },
        { value: 'TDCi 2.0', label: 'TDCi 2.0' },
        { value: 'CRL TDI', label: 'CRL TDI' },
        { value: 'B47D20', label: 'B47D20' },
        { value: 'M274', label: 'M274' },
        { value: 'EA211', label: 'EA211' },
        { value: 'L15B7', label: 'L15B7' }
    ],
    kw: [
        { value: 50, label: 50 },
        { value: 75, label: 75 },
        { value: 100, label: 100 },
        { value: 150, label: 150 }
    ],
    quality: [
        { value: 'Nou', label: 'Nou' },
        { value: 'Utilizat', label: 'Utilizat' },
        { value: 'Refurbished', label: 'Refurbished' },
        { value: 'Avariat', label: 'Avariat' }
    ],
    color: [
        { value: 'Roșu', label: 'Roșu' },
        { value: 'Albastru', label: 'Albastru' },
        { value: 'Verde', label: 'Verde' },
        { value: 'Negru', label: 'Negru' },
        { value: 'Alb', label: 'Alb' },
        { value: 'Argintiu', label: 'Argintiu' },
        { value: 'Gri', label: 'Gri' },
        { value: 'Metalizat', label: 'Metalizat' }
    ],
    supplier: [
        { value: 'Furnizor 1', label: 'Furnizor 1' },
        { value: 'Furnizor 2', label: 'Furnizor 2' },
        { value: 'Furnizor 3', label: 'Furnizor 3' },
        { value: 'Furnizor 4', label: 'Furnizor 4' },
        { value: 'Furnizor Piese Ford', label: 'Furnizor Piese Ford' },
        { value: 'Furnizor Piese BMW', label: 'Furnizor Piese BMW' },
        { value: 'Furnizor Piese Toyota', label: 'Furnizor Piese Toyota' },
        { value: 'Depozit Piese Audi', label: 'Depozit Piese Audi' },
        { value: 'Depozit Piese Mercedes', label: 'Depozit Piese Mercedes' },
        { value: 'Furnizor Piese VW', label: 'Furnizor Piese VW' },
        { value: 'Depozit Piese Honda', label: 'Depozit Piese Honda' }
    ],
    halaZona: [
        { value: 'Hala 1', label: 'Hala 1' },
        { value: 'Hala 2', label: 'Hala 2' },
        { value: 'Hala 3', label: 'Hala 3' },
        { value: 'Hala 4', label: 'Hala 4' },
        { value: 'Hala 5', label: 'Hala 5' },
        { value: 'Hala 6', label: 'Hala 6' }
    ],
};