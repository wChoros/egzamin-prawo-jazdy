import os
import sys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from dotenv import load_dotenv
from selenium.webdriver import ChromeService
from seleniumwire import webdriver  # using selenium-wire for request interception

load_dotenv()

def login(driver):
    email = os.getenv("EMAIL_RESERV")
    password = os.getenv("PASSWORD_RESERV")

    driver.find_element(By.ID, "username").send_keys(email)
    driver.find_element(By.ID, "password").send_keys(password)
    driver.find_element(By.ID, "register-button").click()

    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, "#main-header-menu > div > div.right-panel.ng-tns-c1251938777-2.ng-star-inserted > div.my-account.ng-tns-c1251938777-2 > div > div > button")
            )
        )
    except Exception:
        pass


def main():
    chromedriver_path = "/usr/bin/chromedriver"

    url = "https://info-car.pl/oauth2/login"
    options = webdriver.ChromeOptions()
    options.add_argument('--headless=new')  # newer headless mode
    options.add_argument('--log-level=3')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-software-rasterizer')
    options.add_argument('--disable-dev-shm-usage')

    service = ChromeService(executable_path=chromedriver_path)
    driver = webdriver.Chrome(service=service, options=options)

    driver.get(url)
    login(driver)

    search_url = "https://info-car.pl/oauth2/userinfo"
    for request in driver.requests:
        if request.url == search_url:
            print(request.headers.get('Authorization', 'No Authorization header found'))
            with open(f"{os.getenv("APP_PATH")}/reservationToken.txt", 'w+') as file:
                file.write(request.headers.get('Authorization', 'No Authorization header found'))
    # driver.quit()

if __name__ == "__main__":
    main()
