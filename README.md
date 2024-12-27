## Zmiany w tym forku
1. Naparwione (na dzień 27.12.2024) pozyskiwanie harmonogramu wolnych terminów egzaminów praktycznych
2. Odseparowane konto odpytujące serwery info-car o dostępne terminy od naszego głównego konta do rezerwacji terminu - tym sposobem nawet w przypadku blokady konta główne konto jest bezpieczne
3. Oddzielnie funkcji wyszukiwania najszybszych terminów od funkcji automatycznej rezerwacji - dzięki temu jesteśmy w stanie na bieżąco obserwować zmiany najszybszego terminu oraz automatycznie rezerwować terminy jedynie w interesującym nas przedziale dat.
4. Dodana została opcja powiadomień poprzez webhook'a discord - Discord -> Ustawienia serwera -> Integracje -> Webhooki
5. Dodana została opcja wyzwalania makr w aplikacji macrodroid na androida - osbiście wykorzystywałem to do powiadamiania oraz uruchamiania budzika w momencie rezerwacji terminu - moje makra znajdują się w folderze macrodroid.
6. Aktualizacja utils\chromedriver.exe aby obsługiwał aktualną wersję chorme'a
7. Zmiany w formie prezentowania wyników działania skryptu w konsoli
8. Zmiana częstotliwości odświeżania na co 30s
9. Tryb powolny (dwukrotnie wolniejsze odświeżanie) - aktywowany automatycznie po wykryciu błędu pozyskiwania danych o egzaminach
10. Automatyczne czyszczenie konsoli po 50 aktualizacjach.
11. Wypisywanie błędów w konsoli i automatyczny restart skryptu w przypadku awarii (nie działa w pełni prawidłowo !)
10. Pewnie coś jescze :D

WAŻNE! - Z powodzeniem wykorzystałem ten skrypt do pozyskania terminu dużo wcześniej niż oficjalną metodą (27.12 zamiast 15.01 i to w dogodnej godzinie), ale z racji na zdanie egzaminu przy pierwszej próbie zaniechałem dalszej pracy nad udoskonalaniem mojej wersji programu, napewno znajdzie się w nim kilka błędów (jak chociażby losowe crashowanie po kilku dniach pracy ciągłej) zachęcam do dlaszej pracy nad kodem :). Skrpyt był testowany jedynie na Windows 11 postawionym na serwerze Proxmox - proces instalacji przebiega tak samo (build.bat)

Program odświeża dane co 30s i jak tylko wykryje odpowiedni termin rezewuje go na stronie info-car - dzięki temu zanim aplikacje typu szybkie-prawko (odświeżanie co 5 min) powiadomią ludzi o zmianie terminu to my najprawdopodobniej już będziemy mieć zarezerwowany termin :D (oczywiście trzeba go w czasie opłacić ręcznie na stronie)- nie polecam zwiększania częstotliwości odświeżania gdyż może to skutkować błędami typu "Too many requests" ze strony api info-car.

Aby zmniejszyć ilość powiadomień polecam z linijki 117 w pliku scripts\js\startSearching.js (firstCombined=...) usunąć "+firstPlaces" program wtedy będzie ignorował zmiany w ilości dostępnych miejsc o danej godzinie.


## Jak aplikacja działa

Po uruchomieniu aplikacji będzie ona szukała rezerwacji według twoich preferencji ustawionych w pliku .env do momentu jej znalezienia. Jeżeli aplikacji uda się zrobić rezerwacje wyświatli się o tym informacja w konsoli, następnie trzeba wejść w swój profil na info car i zapłacić za rezerwacje w ciągu około 40 minut inaczej zostanie ona odwołana. Dostępne terminy są sprawdzane co 5 sekund.

## Instalacja

1. Pobierz cały folder z repozytorium.
2. Pobierz rekomendowany instalator node js z tego linku `https://nodejs.org/en`, a następnie przejdź instalacje.
3. Pobierz najnowszą wersją python z tego linku `https://www.python.org/downloads/`, a następnie przejdź instalacje.
4. Pobierz przeglądarke Google Chrome, potrzebna jest do poprawnego działania aplikacji.
5. Utwórz plik .env i wypełnij jak pokazano w pliku .env.example. (WORDID można znaleźć w pliku words.json w folderze data według preferencji)
6. Uruchom plik build.bat, a następnie start.bat ( Przy każdym następnym odpaleniu aplikacji tylko start.bat ).

## Zmienne env

Zmienne env, które muszą zostać wypełnione dla poprawnego działania aplikacji:

Konto "słup" do pozyskiwania danych o terminach:
- `EMAIL` - email drugiego konta infocar (do pozyskiwania danych o terminach - konto słup)
- `PASSWORD` - hasło drugiego konta infocar (do pozyskiwania danych o terminach - konto słup)

Konto główne oraz dane do rezerwowania terminów (używane tylko wtedy):
- `EMAIL_RESER` - email konta infocar (wykorzystywanego jedynie do rezerwacji terminu po jego znalezieniu)
- `PASSWORD_RESERV` - hasło konta infocar (wykorzystywanego jedynie do rezerwacji terminu po jego znalezieniu)
- `FIRST_NAME` - twoje pierwsze imie zapisane na stronie info-car
- `LAST_NAME` - twoje nazawisko zapisane na stronie info-car
- `PESEL` - twój numer PESEL
- `PHONE_NUMBER` - twój numer telefonu przypisany do strony info-car
- `PKK_NUMBER` - numer twojego profilu kandydata na kierowcę
  
Kategoria egzaminu oraz id word'u - id znajdziesz pod https://info-car.pl/api/word/word-centers/:
- `CATEGORY` - kategoria egzaminu który chcesz zarezerwować (Działanie aplikacji było sprawdzane jedynie na kategorii B)
- `WORDID` - ID word w którym chcesz zdawać egzamin na kierowcę

Przedział dat w którym szukany jest najwcześniejszy termin - zachowaj format zgodnie z przykładem w pliku .env.example:
- `DATE_FROM` - data wyznaczająca początkowy zakres szukania najwcześniejszego dostępnego terminu
- `DATE_TO` - data wyznaczająca końcowy zakres szukania najwcześniejszego dostępnego terminu
  
Przedział dat w których ma zostać dokonana rezerwacja - zachowaj format zgodnie z przykładem:
- `RESERVATIONMODE` - Tryb pracy skryptu -> 0 - tylko wyszkiwanie najszybszych terminów, 1 - automatyczna rezerwacja terminu
- `DATE_FROM_RESERVATION` - data wyznaczająca początkowy zakres szukania dogodnego terminu do rezerwacji
- `DATE_TO_RESERVATION` - data wyznaczająca końcowy zakres szukania dogodnego terminu do rezerwacji

Preferowane godziny egzaminu - od najistotniejszych (uwaga! godziny jednocyfrowe zapisuj z 0 - np. 09):
- `PREFERRED_HOURS` - preferowane godziny egzaminu których aplikacja będzie szukać (od lewej do prawej)

Ustawienia kanałów powiadomień:
- `NOTIFYMACRODROID` - powiadomienia poprzez webhook macrodroid
- `NOTIFYDISCORD` - powiadomienia poprzez webhook discord

URL webhooka discord - do powiadamiania użytkownika:
- `DISCORDURL` - adres url webhook'a discord

URL webhooka macrodroid - jest to aplikacja do automatyzacji na androida (przykładowe makra w folderze macrodroid w repozytorium):
- `MACRODROIDURL` - adres URL do wyzwalnia makra w macrodroid przy znalezieniu nowego najszybszego terminu
- `MACRODROIDURLRESERV` - adres URL do wyzwalnia makra w macrodroid przy rezerwacji terminu
