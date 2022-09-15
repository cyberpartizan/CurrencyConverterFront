import {useEffect, useState} from 'react';
import Axios from 'axios';
import Dropdown from 'react-dropdown';
import DatePicker from "react-datepicker";
import {HiSwitchHorizontal} from 'react-icons/hi';
import 'react-dropdown/style.css';
import "react-datepicker/dist/react-datepicker.css";
import './App.css';

function App() {

    const [info, setInfo] = useState([]);
    const [input, setInput] = useState(0);
    const [from, setFrom] = useState("RUB");
    const [to, setTo] = useState("USD");
    const [fromHistory, setFromHistory] = useState("RUB");
    const [toHistory, setToHistory] = useState("USD");
    const [historyList, setHistoryList] = useState([]);
    const [options, setOptions] = useState([]);
    const [output, setOutput] = useState(0);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [token, setToken] = useState("");
    const [date, setDate] = useState(new Date());

    const domain = "http://localhost:8080"

    const handleLogin = async () => {
        const jwt = await Axios.post(domain + `/auth/login`,
            {
                username: username,
                password: password
            }
        ).then(res => res.data.jwt);
        if (jwt) {
            setToken(jwt)
            initCurrencies(jwt)
            setIsActive(current => !current);
        }
    };

    const handleRegister = async () => {
        const jwt = await Axios.post(domain + `/auth/register`,
            {
                username: username,
                password: password
            }
        ).then(res => res.data.jwt);
        if (jwt) {
            alert("Регистрация успешна завершена")
        }else {
            alert("При регисрации что-то пошло не так")
        }
    };

    useEffect(() => {
        setOptions(info);
    }, [info])

    function initCurrencies(token) {
        Axios.get(
            domain + `/currency/all`, {headers: {Authorization: 'Bearer ' + token}})
            .then((res) => setInfo(res.data));
    }

    function convert() {
        const fromId = info.find(a => a.char_code === from).id;
        const toId = info.find(a => a.char_code === to).id;
        Axios.get(
            domain + `/convert?from_currency_id=${fromId}&to_currency_id=${toId}&amount=${input}`,
            {headers: {Authorization: 'Bearer ' + token}})
            .then((res) => {
                setOutput(res.data);
            });
    }

    function getHistory() {
        const fromId = info.find(a => a.char_code === fromHistory).id;
        const toId = info.find(a => a.char_code === toHistory).id;
        Axios.get(
            domain + `/history/pair?from_currency_id=${fromId}&to_currency_id=${toId}&date=${date.toLocaleDateString()}`,
            {headers: {Authorization: 'Bearer ' + token}})
            .then((res) => {
                setHistoryList(res.data);
            });
    }

    function flip() {
        const temp = from;
        setFrom(to);
        setTo(temp);
    }

    return (
        <div className="App">
            <div className="login" style={{visibility: isActive ? 'visible' : 'hidden'}}>
                <div>
                    <label>
                        <input className="form" type="text" name="login" placeholder="Логин" onChange={(e) => {
                            setUsername(e.target.value)
                        }}/>
                    </label>
                    <label>
                        <input className="form" type="password" name="password" placeholder="Пароль" onChange={(e) => {
                            setPassword(e.target.value)
                        }}/>
                    </label>
                </div>
                <div className="enter">
                    <input className="input" type="submit" value="Регистрация" onClick={handleRegister}/>

                </div>
                <div className="registration">
                    <input className="input" type="submit" value="Войти" onClick={handleLogin}/>
                </div>
            </div>
            <div className="mainApp" style={{visibility: isActive ? 'hidden' : 'visible'}}>
                <div className="child">
                    <div className="heading">
                        <h1>Конвертер валют</h1>
                    </div>
                    <div className="container">
                        <div className="left">
                            <h3>Количество</h3>
                            <input type="text"
                                   onChange={(e) => setInput(e.target.value)}/>
                        </div>
                        <div className="middle">
                            <h3>Из валюты:</h3>
                            <Dropdown options={options.map(a => a.char_code)}
                                      onChange={(e) => {
                                          setFrom(e.value)
                                      }}
                                      value={from} placeholder="From"/>
                        </div>
                        <div className="switch">
                            <HiSwitchHorizontal size="30px"
                                                onClick={() => {
                                                    flip()
                                                }}/>
                        </div>
                        <div className="right">
                            <h3>В валюту:</h3>
                            <Dropdown options={options.map(a => a.char_code)}
                                      onChange={(e) => {
                                          setTo(e.value)
                                      }}
                                      value={to} placeholder="To"/>
                        </div>
                    </div>
                    <div className="result">
                        <button onClick={() => {
                            convert()
                        }}>Конвертировать
                        </button>
                        <p>{output.toFixed(2) + " " + to}</p>

                    </div>
                </div>
                <div className="child">
                    <h1>История</h1>
                    <div>
                        <DatePicker selected={date} onChange={(date: Date) => setDate(date)}/>
                        <div className="middle">
                            <h3>Из валюты:</h3>
                            <Dropdown options={options.map(a => a.char_code)}
                                      onChange={(e) => {
                                          setFromHistory(e.value)
                                      }}
                                      value={fromHistory} placeholder="From"/>
                        </div>
                        <div className="right">
                            <h3>В валюту:</h3>
                            <Dropdown options={options.map(a => a.char_code)}
                                      onChange={(e) => {
                                          setToHistory(e.value)
                                      }}
                                      value={toHistory} placeholder="To"/>
                        </div>
                        <div className="input_div">
                            <button onClick={() => {
                                getHistory()
                            }}>Поиск
                            </button>
                        </div>
                        <div>
                            <div className="table">
                                <table>
                                    <tr>
                                        <th>Исходная валюта</th>
                                        <th>Целевая валюта</th>
                                        <th>Исходная сумма</th>
                                        <th>Целевая сумма</th>
                                        <th>Дата</th>
                                    </tr>
                                    {historyList.map((val, key) => {
                                        return (
                                            <tr key={key}>
                                                <td>{val.source_currency.char_code}</td>
                                                <td>{val.target_currency.char_code}</td>
                                                <td>{val.source_amount.toFixed(2)}</td>
                                                <td>{val.target_amount.toFixed(2)}</td>
                                                <td>{val.date}</td>
                                            </tr>
                                        )
                                    })}
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default App;