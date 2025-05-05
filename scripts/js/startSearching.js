import fetch from "node-fetch";
import getToken from './getToken.js';
import { takeReservation } from './take-reservation.js';
import { sleep } from './sleep.js';
import fs from 'fs'

const getBearerTokensForEmails = async (emails) => {
	const tokens = await Promise.all(
		emails.map(async (email) => {
			let token = "";
			do {
				token = await getToken(email);
				console.log(`Token for ${email}: ${token}\n`);
			} while (token === "");
			return token;
		})
	);
	return tokens;
}

export const startSearching = async () => {
	const searchEmails = process.env.EMAILS.split(',')
	let currSearchEmailIndex = 0
	let searchEmailsBearers = await getBearerTokensForEmails(searchEmails)

	console.log(`Retrieving authorization token for emails: ${searchEmails}`)
	process.stdout.write('\x1Bc');
	let clearCount = 0;
	let firstCombined = 0;
	let previousFirstCombined = 0;
	let retryCount = 0;
	let firstDate = 0;
	let firstTime = 0;
	let firstPlaces = 0;
	let firstID = 0;
	let fetchRate = 4; //delay between schedule download in s
	let reservationMade = 0;
	let firstRun = 1;

	while (true) {
		try {
			await sleep(fetchRate * 1000)
			//GATHERING DATA
			console.log(`==============INFO==============\n${new Date().toLocaleTimeString()}`);
			console.log(`Updating schedule data with email: ${searchEmails[currSearchEmailIndex]}...`);
			console.log(`Emails: ${searchEmails}}, index: ${currSearchEmailIndex}, length: ${searchEmails.length}`)
			if (reservationMade == 1) {
				console.log(" RESERVATION ALREADY MADE!");
				console.log(" RESTART SCRIPT TO RESERV NEW");
			}
			const response = await fetch(`https://info-car.pl/api/word/word-centers/exam-schedule`, {
				credentials: "include",
				headers: {
					"User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0",
					Accept: "application/json, text/plain, */*",
					"Accept-Language": "pl-PL",
					Authorization: await searchEmailsBearers[currSearchEmailIndex],
					"Content-Type": "application/json",
					"Sec-Fetch-Dest": "empty",
					"Sec-Fetch-Mode": "cors",
					"Sec-Fetch-Site": "same-origin",
					"Sec-GPC": "1",
				},
				referrer:
					"https://info-car.pl/new/prawo-jazdy/zapisz-sie-na-egzamin-na-prawo-jazdy/wybor-terminu",
				body: JSON.stringify({
					category: "B",
					endDate: process.env.DATE_TO,
					startDate: process.env.DATE_FROM,
					wordId: process.env.WORDID,
				}),
				method: "PUT",
				mode: "cors",
			}).catch(err => { throw new Error(err); });
			if (response.status !== 200) {
				retryCount++;
				if (retryCount >= 5) {
					console.log(" Too many tries to fetch...");
					process.exit();
				}
				console.log(" Retrieving new auth token...");
				searchEmailsBearers[currSearchEmailIndex] = getToken(searchEmails[currSearchEmailIndex])
				if (currSearchEmailIndex < searchEmailsBearers.length - 1) {
					currSearchEmailIndex += 1
				}
				else {
					currSearchEmailIndex = 0
				}
				continue;
			} else {
				if (currSearchEmailIndex < searchEmailsBearers.length - 1) {
					currSearchEmailIndex += 1
					
				}
				else {
					currSearchEmailIndex = 0
				}
			}
			const { schedule } = await response.json();
			// Print available hours for each scheduled day
			console.log("+------AVAILABLE HOURS---------+");
			schedule.scheduledDays.forEach(day => {
				if (day.scheduledHours.some(hour => hour.practiceExams.length !== 0)) {
					console.log(`| Date: ${day.day}              |`);
					day.scheduledHours.forEach(hour => {
						if (hour.practiceExams.length !== 0) {
							console.log(`| Time: ${hour.time} - Places: ${hour.practiceExams[0].places} |`);
						}
					});
					console.log("+------------------------------+");
				}
			});
			//DATA FILTRATION
			const DATE_FROM = process.env.DATE_FROM;
			const DATE_TO = process.env.DATE_TO;
			const DATE_FROM_RESERV = process.env.DATE_FROM_RESERVATION;
			const DATE_TO_RESERV = process.env.DATE_TO_RESERVATION;
			const reservationMode = process.env.RESERVATIONMODE;
			//Filter out days outside range
			var strictedScheduledDates = schedule
			var strictedScheduledDatesReserv = schedule
			strictedScheduledDates = strictedScheduledDates.scheduledDays.filter(date => { return ((new Date(date.day) >= new Date(DATE_FROM)) && (new Date(date.day) <= new Date(DATE_TO))) });
			strictedScheduledDatesReserv = strictedScheduledDatesReserv.scheduledDays.filter(date => { return ((new Date(date.day) >= new Date(DATE_FROM_RESERV)) && (new Date(date.day) <= new Date(DATE_TO_RESERV))) });
			//Filter out days without practice exams
			const strictedPractiseExams = strictedScheduledDates.filter(scheduledDate => { return scheduledDate.scheduledHours.some(scheduledHour => scheduledHour.practiceExams.length !== 0) });
			const strictedPractiseExamsReserv = strictedScheduledDatesReserv.filter(scheduledDate => { return scheduledDate.scheduledHours.some(scheduledHour => scheduledHour.practiceExams.length !== 0) });


			//SEARCHING FOR RESERVATION
			for (let y = 0; y < strictedPractiseExamsReserv.length; y++) {
				if (reservationMade == 0) {
					let found = false;
					let smallestIndex;
					let scheduledHourIndex;
					console.log("\n");
					console.log("+--------PREFERED-DATE---------+");
					console.log(`|          ${strictedPractiseExamsReserv[y].day}          |`);
					console.log("+--------PREFERED HOURS--------+");
					for (const [i, hour] of strictedPractiseExamsReserv[y].scheduledHours.entries()) {
						if (hour.practiceExams.length !== 0 && hour.practiceExams[0].id != 0) {
							console.log(`| ${hour.time} - Places: ${hour.practiceExams[0].places}         |`);
							const index = process.env.PREFERRED_HOURS.split(",").indexOf(hour.time.split(":")[0]);
							if (found === false) {
								if (index > -1) {
									smallestIndex = index;
									scheduledHourIndex = i;
									found = true;
								}
							}
							else if ((index > -1) && (smallestIndex > index)) {
								smallestIndex = index;
								scheduledHourIndex = i;
							}

						}
					}
					console.log("+------------------------------+");
					console.log("\n");
					//TAKING RESERVATION
					if (scheduledHourIndex != undefined && reservationMade == 0 && reservationMode == 1) {
						console.log("+----TAKING RESERVATION FOR----+");
						console.log(`| DATE: ${strictedPractiseExamsReserv[y].day}             |`);
						console.log(`| TIME: ${strictedPractiseExamsReserv[y].scheduledHours[scheduledHourIndex].time}               |`);
						console.log(`| ID:   ${strictedPractiseExamsReserv[y].scheduledHours[scheduledHourIndex].practiceExams[0].id}    |`);
						console.log("+------------------------------+");
						console.log("Retrieving reservation authorization token...")
						let bearer_token_reserv = await fs.promises.readFile(`${process.env.APP_PATH}/reservationToken.txt`, 'utf8').then(data => data.trim()).catch(err => {
							console.error(`Error reading file: ${err.message}`);
							throw err;
						});
						console.log(bearer_token_reserv);

						console.log(strictedPractiseExamsReserv[y].scheduledHours[scheduledHourIndex].practiceExams[0].date);
						await takeReservation(strictedPractiseExamsReserv[y].scheduledHours[scheduledHourIndex].practiceExams[0].id, bearer_token_reserv);
						reservationMade = 1;
						//SENDING NOTIFICATIONS ABOUT RESERVATION
						//DISCORD WEBHOOK
						if (process.env.NOTIFYDISCORD == 1) {
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
											'Zarezerwowano termin: ' + strictedPractiseExamsReserv[y].day + " - " + strictedPractiseExamsReserv[y].scheduledHours[scheduledHourIndex].time,
										embeds: [
											{
												color: 11730954,
												title: 'Data:',
												description: strictedPractiseExamsReserv[y].day + " - " + strictedPractiseExamsReserv[y].scheduledHours[scheduledHourIndex].time,
												fields: [
													{
														name: 'Wolnych miejsc:',
														value: strictedPractiseExamsReserv[y].scheduledHours[scheduledHourIndex].practiceExams[0].places,
													},
													{
														name: 'ID terminu:',
														value: strictedPractiseExamsReserv[y].scheduledHours[scheduledHourIndex].practiceExams[0].id,
													},
													{
														name: 'DATA Z TERMINARZA:',
														value: strictedPractiseExamsReserv[y].scheduledHours[scheduledHourIndex].practiceExams[0].date,
													},
												],
											},
										],
									}),
								}
							);
						}

						//FINDING FIRST DATE AND HOURS
						if (strictedPractiseExams.length !== 0) {
							let found = false;
							let firstFound = false;
							let smallestIndex;
							let scheduledHourIndex;
							console.log("+----------FIRST DATE----------+");
							console.log(`|          ${strictedPractiseExams[0].day}          |`);
							console.log("+----------FIRST HOURS---------+");
							for (const [i, hour] of strictedPractiseExams[0].scheduledHours.entries()) {
								if (hour.practiceExams.length !== 0) {
									console.log(`| ${hour.time} - Places: ${hour.practiceExams[0].places}         |`);
									if (firstFound == false) {
										firstTime = hour.time;
										firstPlaces = hour.practiceExams[0].places;
										firstID = hour.practiceExams[0].id;
									}
									firstFound = true;
								}
							}
							firstDate = strictedPractiseExams[0].day;
							firstCombined = firstDate + firstTime + firstID + firstPlaces;
							console.log("+----------FIRST TERM----------+");
							console.log(`| DATE: ${firstDate}             |`);
							console.log(`| TIME: ${firstTime}               |`);
							console.log(`| PLACES: ${firstPlaces}                    |`);
							console.log("+------------------------------+");

							//SENDING NOTIFICATIONS ABOUT NEW DATES
							if (previousFirstCombined != firstCombined) {
								console.log(" Sending new date notifications...");
								//DISCORD WEBHOOK
								if (process.env.NOTIFYDISCORD == 1) {
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
													'Zmiana najszybszego terminu: ' + firstDate + " - " + firstTime + " - Places: " + firstPlaces,
												embeds: [
													{
														color: 11730954,
														title: 'Data:',
														description: firstDate + " - " + firstTime,
														fields: [
															{
																name: 'Wolnych miejsc:',
																value: firstPlaces,
															},
															{
																name: 'ID terminu:',
																value: firstID,
															},
														],
													},
												],
											}),
										}
									);
								}
								previousFirstCombined = firstCombined;
							}
							//process.exit();
						}
					}
				}
			}
			console.log("\n");
			//AUTO CONSOLE CLEARING
			clearCount++;
			if (clearCount === 50) {
				process.stdout.write('\x1Bc');
				clearCount = 0;
			}
		} catch (err) {
			//ERROR HANDLING
			console.log(err);
		}
	}
};