const form = document.getElementById('form')
const firstname_input = document.getElementById('firstname-input')
const email_input = document.getElementById('email-input')
const password_input = document.getElementById('password-input')
const repeat_input = document.getElementById('repeat-input')
const error_message =document.getElementById('error-message')

form.addEventListener('submit', (e) => {

    let errors =[]

    if(firstname_input){
        //if there is a first name this is the sign up form
        errors = getSignupFormErrors(firstname_input.value, email_input.value, password_input.value, repeat_input.value)

    }
    else{
        //no firstname means this is the login form
        errors = getLoginFormErrors(email_input.value, password_input.value)
    }    
    if (errors.length > 0) {
        e.preventDefault()
        error_message.innerText = errors.join(" .")
        //prevents submission if there isnt any submission
    }
})

function getSignupFormErrors(firstname, email, password, _repeat){
    let errors=[]

    if (firstname === '' || firstname == null) {
        errors.push('Firstname not entered')
        firstname_input.parentElement.classList.add('incorrect')
    }
    if (email === '' || email == null) {
        errors.push('Email needed.')
        email_input.parentElement.classList.add('incorrect')
    }else if (!/^[\w-\.]+@[a-zA-Z]+\.[a-zA-Z]{2,3}\.edu$/.test(email)) {
        errors.push('Please enter your university email (e.g., yourname@university.edu)')
        email_input.parentElement.classList.add('incorrect')
    }
    if (password === '' || password == null) {
        errors.push('A password is required')
        password_input.parentElement.classList.add('incorrect')
    }
    if (password.length < 8) {
        errors.push('Password requires at least 8 characters')
        password_input.parentElement.classList.add('incorrect')
    }
    if (password !== repeat_input){
        errors.push('Passwords must be identical.')
        repeat_input.parentElement.classList.add('incorrect')
    }

    return errors;
}

function getLoginFormErrors(email, password){
    let errors = []

    if (email === '' || email == null) {
        errors.push('Email needed.')
        email_input.parentElement.classList.add('incorrect')
    }
    if (password === '' || password == null) {
        errors.push('A password is required')
        password_input.parentElement.classList.add('incorrect')
    }else if (!/^[\w-\.]+@[a-zA-Z]+\.[a-zA-Z]{2,3}\.edu$/.test(email)) {
        errors.push('Please enter your university email (e.g., yourname@university..edu)')
        email_input.parentElement.classList.add('incorrect')
    }

    return errors;
}

const allInputs = [firstname_input, email_input, password_input, repeat_input].filter(input => input != null)

allInputs.forEach(input =>{
    input.addEventListener('input', () => {
        if (input.parentElement.classList.contains('incorrect')) {
            input.parentElement.classList.remove('incorrect')
            error_message.innerText = ''
        }
    })
})