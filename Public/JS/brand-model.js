var modelsByBrand = {
    Maruti: ["800 AC", "A-Star Vxi", "Alto 800 2016-2019 LXI", "Alto 800 2016-2019 VXI", "Alto 800 LXI", "Alto K10 LXI", "Alto K10 VXI", "Alto LXi", "Baleno Zeta 1.2", "Baleno Zeta Automatic", "Celerio VXI", "Celerio VXI AT", "Celerio ZXI", "Ciaz VDi Plus SHVS", "Ciaz VXi Plus", "Dzire VDI", "Eeco 7 Seater Standard", "Ertiga VDI", "Ertiga ZDI", "Ritz LXI", "Ritz VDi", "Swift 1.3 VXi", "Swift Dzire LDI", "Swift Dzire Tour LDI", "Swift Dzire VXI", "Swift VDI", "Swift VDI BSIV", "Swift VXI BSIV", "SX4 Vxi BSIV", "SX4 ZXI MT BSIV", "Vitara Brezza ZDi Plus", "Vitara Brezza ZDi", "Vitara Brezza ZDi Plus Dual Tone", "Wagon R LXI", "Wagon R VXI"],
    Hyundai: ["Accent GLE", "Creta 1.6 CRDi AT SX Plus", "Creta 1.6 CRDi SX", "Creta 1.6 SX Plus Petrol Automatic", "Elantra CRDi SX", "Elite i20 Petrol Asta", "Elite i20 Petrol Sportz", "EON D Lite Plus", "EON Era", "EON Era Plus", "EON Magna Plus", "EON Sportz", "Grand i10 1.2 CRDi Sportz", "Grand i10 1.2 Kappa Asta", "Grand i10 1.2 Kappa Sportz", "Grand i10 Asta", "Grand i10 CRDi Sportz", "Grand i10 Sportz", "i10 Era", "i10 Magna", "i10 Sportz", "i10 Sportz 1.2", "i20 1.2 Magna", "i20 1.2 Sportz", "i20 Asta", "i20 Asta 1.4 CRDi", "i20 Magna", "i20 Sportz 1.2", "Santro Xing GL", "Verna 1.6 SX", "Verna 1.6 SX VTVT", "Xcent 1.1 CRDi Base", "Xcent 1.1 CRDi S"],
    Audi: ["A4 2.0 TDI", "A4 2.0 TDI 177 Bhp Premium Plus", "A4 2.0 TDI Multitronic", "A4 35 TDI Premium", "Q5 2008-2012 2.0 TDI", "Q5 30 TDI quattro Premium Plus", "Q7 45 TDI Quattro Technology"],
    BMW: ["3 Series 320d", "3 Series 320d Luxury Line", "3 Series 320d Sedan", "5 Series 2013-2017 530d M Sport", "X1 sDrive 20d xLine", "X5 xDrive 30d"],
    Chevrolet: ["Aveo U-VA 1.2 LS", "Beat Diesel LS", "Beat Diesel LT", "Beat LS", "Beat LT", "Cruze LTZ", "Spark 1.0 LT", ""], 
    Fiat: ["Avventura MULTIJET Emotion", "Linea Emotion", "Punto EVO 1.2 Emotion", ""],
    Ford: ["Aspire Titanium Diesel", "EcoSport 1.0 Ecoboost Titanium Plus", "EcoSport 1.5 Diesel Titanium", "Ecosport 1.5 DV5 MT Titanium", "Ecosport 1.5 DV5 MT Titanium Optional", "EcoSport 1.5 TDCi Titanium", "Endeavour 3.2 Titanium AT 4X4", "Figo Aspire 1.2 Ti-VCT Titanium", "Figo Diesel EXI", "Figo Diesel Titanium", "Figo Petrol ZXI", ],
    Honda: ["Accord 2.4 AT", "Amaze E i-Vtech", "Amaze S i-Dtech", "Amaze S i-Vtech", "Amaze VX i-DTEC", "Brio S MT", "City 1.5 S MT", "City 1.5 S AT", "City 1.5 V MT", "City i VTEC CVT VX"],
    Mahindra: ["Bolero ZLX", "Scorpio SLE BSIV", "Scorpio VLX", "TUV 300 2015-2019 T8", "XUV500 AT W10 FWD", "XUV500 W6 2WD", "XUV500 W8 2WD"],
    MercedesBenz: ["B Class B180", "A Class A180 CDI", "E-Class 2009-2013 E250 CDI Elegance", "E-Class 280 CDI", "M-Class ML 350 4Matic", "New C-Class C 220 CDI Avantgarde", "New C-Class C 220d Avantgarde Edition C"], 
    Nissan: ["Micra Diesel XV", "Sunny 2011-2014 XL"],
    Renault: ["Duster 110PS Diesel RxL", "Duster 110PS Diesel RxZ", "Duster 85PS Diesel RxL", "KWID RXT", ""],
    Skoda: ["Laura Ambiente", "Octavia Elegance 2.0 TDI AT", "Superb Elegance 1.8 TSI AT", ""],
    Tata: ["Indica V2 eLS", "Indigo LS", "Nano Twist XT", "Tiago 1.2 Revotron XZ", "Zest Quadrajet 1.3 75PS XE"],
    Toyota: ["Etios G", "Etios GD", "Etios Liva GD", "Fortuner 2.8 2WD AT", "Fortuner 3.0 Diesel", "Fortuner 4x2 AT", "Fortuner 4x2 Manual", "Innova 2.5 G (Diesel) 8 Seater", "Innova 2.5 V Diesel 7-seater", "Innova 2.5 VX (Diesel) 7 Seater", "Innova Crysta 2.4 VX MT"],
    Volkswagen: ["Jetta 2013-2015 2.0L TDI Highline AT", "Polo 1.2 MPI Comfortline", "Polo 1.2 MPI Highline", "Polo Diesel Comfortline 1.2L", "Polo Petrol Comfortline 1.2L", "Vento Petrol Highline", "Vento Petrol Highline AT", ]
}

    function changeModel(value) {
        if (value.length == 0) document.getElementById("model").innerHTML = "<option></option>";
        else {
            var modelOptions = "";
            for (modelId in modelsByBrand[value]) {
                modelOptions += "<option>" + modelsByBrand[value][modelId] + "</option>";
            }
            document.getElementById("model").innerHTML = modelOptions;
        }
    }