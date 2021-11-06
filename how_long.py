import json
import numpy_financial as npf
import math
        
class Calculator:
    def __init__(self, balance=350000, ret_rate=0.05, inflation=0.03, expenses=3500, income=1500, years = 30):
        self.balance = balance
        self.expenses = expenses
        self.ret_rate = ret_rate
        self.inflation = inflation
        self.income = income
        self.years = years
        self.withdrawal = self.expenses - self.income
        self.percentage = self.withdrawal/self.balance
        self.growth_rate = ret_rate/12 - inflation/12
        self.reverse_calculation = round(npf.pmt((self.ret_rate-self.inflation)/12, 12*self.years, self.balance),2)*-1

    def calculate_years_until_broke(self):
        years_cutoff = 120

        if self.percentage <= self.growth_rate:
            print('a')
            return 'Never run out of money!'
            
        if self.growth_rate == 0:
            result_value = 0 if self.withdrawal == 0 else self.balance/self.withdrawal/12
        else: 
            result_value = 0 if self.withdrawal == 0 else npf.nper((self.ret_rate-self.inflation)/12, self.withdrawal*-1, self.balance)/12
        result_value = math.floor(result_value)

        if result_value < 1:
            return 'Run out of money in less than 1 year'
        elif result_value ==1:
            return 'Run out of money in 1 year'
        elif result_value >= years_cutoff: 
            print('b', result_value)
            return 'Never run out of money!'
            
        else:
            return f'Run out of money in {result_value} years'

    def calculate_monthly_payment(self):
        return self.reverse_calculation

    def terminal_interface_years_until_broke(self):
        print('**Years Until Broke**')
        print('Retirement Plan Balance \n')
        self.balance = float(input('enter your retirement balance: '))
        print('\nInflation / Cost of Living Adjustment \n')
        self.inflation = float(input('enter the inlfation rate: '))
        print('\nAnnual Rate of Return \n')
        self.ret_rate = float(input('enter the annual rate of return on your retirement balance: '))
        print('\nTotal Monthly Income \n')
        self.income = float(input('enter your total monthly income: '))
        print('\nTotal Monthly Expenses \n')
        self.expenses = float(input('enter your total monthly expenses: '))
        print('\nResults: \n')
        result = self.calculate_years_until_broke()
        print(result)
    
    def terminal_interface_payment_calculation(self):
        print('**Payment Calculation**')
        print('How many years do you expect to be retired? \n')
        self.years = float(input('enter your the number of years: '))
        print('\nResults: \n')
        result = self.calculate_monthly_payment()
        print(f'You must spend no more than {result} dollars a month')

    def ingest_json(self, json_string):
        data = json.loads(json_string)
        for key, value in data.items():
            self[key] = value
    


