import fetch from "node-fetch";

export const takeReservation = async (practiceId, token) => {
    return new Promise(async resolve => {
        try {
			let message = "NULL"
			
			/* DEBUG RESERVATION API CALL
			function createObject(propName, propValue){
				this[propName] = propValue;
			}
			var response = new createObject('status',201);
			console.log(JSON.stringify({
                    candidate: {
                        category: process.env.CATEGORY,
                        email: process.env.EMAIL_RESERV,
                        firstname: process.env.FIRST_NAME,
                        lastname: process.env.LAST_NAME,
                        pesel: process.env.PESEL,
                        phoneNumber: process.env.PHONE_NUMBER,
                        pkk: process.env.PKK_NUMBER,
						pkz: null
                    },
                    exam: {
                        "organizationUnitId": process.env.WORDID,
                        "practiceId": practiceId,
                        "theoryId": null
                    },
                    languageAndOsk: {
                        "language": "POLISH",
                        "signLanguage": "NONE",
                        "oskVehicleReservation": null
                    }
                }));
			*/
            const response = await fetch(`https://info-car.pl/api/word/reservations`, {
                method: "POST",
                body: JSON.stringify({
                    candidate: {
                        category: process.env.CATEGORY,
                        email: process.env.EMAIL_RESERV,
                        firstname: process.env.FIRST_NAME,
                        lastname: process.env.LAST_NAME,
                        pesel: process.env.PESEL,
                        phoneNumber: process.env.PHONE_NUMBER,
                        pkk: process.env.PKK_NUMBER,
						pkz: null
                    },
                    exam: {
                        "organizationUnitId": process.env.WORDID,
                        "practiceId": practiceId,
                        "theoryId": null
                    },
                    languageAndOsk: {
                        "language": "POLISH",
                        "signLanguage": "NONE",
                        "oskVehicleReservation": null
                    }
                }),
                headers: {
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0",
                    Accept: "application/json, text/plain, */*",
                    "Accept-Language": "pl-PL",
                    Authorization: token,
                    "Content-Type": "application/json",
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-origin",
                    "Sec-GPC": "1",
                    Priority: "u=0"
                },
            }).catch(err => { throw new Error(err) });

            console.log("Status code: " + response.status);
            if (response.status === 201) {
                console.log("Reservation is being processed! Check the info-car website.");
				message="Rezerwacja jest przetwarzana - sprawdź stronę https://info-car.pl/new/konto/prawo-jazdy/egzaminy ";
            } else if (response.status === 401) {
                console.log("Bearer token outdated!");
				message="Bearer token outdated!";
            } else {
                console.log("Unknown issue!");
				message="Unknown issue!";
            }
			fetch(
			  process.env.DISCORDURL,
			  {
				method: 'post',
				headers: {
				  'Content-Type': 'application/json',
				},
				body: JSON.stringify({
				  username: 'InfoCar - Bot',
				  content:
					'[WAŻNE] Stan rezerwacji',
				  embeds: [
					{
					  color: 11730954,
					  title: 'Status',
					  description: message,
					},
				  ],
				}),
			  }
			);
            resolve("Ok");
        } catch (err) {
			console.log(err);
            process.exit();
        }
    })
}
