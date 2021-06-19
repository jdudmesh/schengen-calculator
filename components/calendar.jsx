
import { useState, useEffect, useContext, useRef } from 'react';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import { ArrowBack, ArrowForward, CalendarToday, ContactSupportOutlined, Delete, SystemUpdate } from '@material-ui/icons';
import { toast } from 'react-toastify';

import firebase from "firebase/app";
import "firebase/database";

import moment, { months } from 'moment';

import styles from './calendar.module.scss'

import { useMediaQuery } from "react-responsive";

export function Calendar({ user }) {

    const isWidth800 = useMediaQuery({ query: "(min-width: 800px)" });

    let debounceTimer = useRef();
    let debounceWindow = useRef();

    const today = moment().startOf("day");
    const oneDay = 86400;
    const sixMonths = oneDay * 180;

    const [isNarrowWindow, setIsNarrowWindow] = useState(true);
    const [doneInitialFetch, setDoneInitialFetch] = useState(false);
    const [dateList, setDateList] = useState([]);
    const [dayCount, setDayCounts] = useState([]);
    const [currentDate, setCurrentDate] = useState(today.clone());
    const [pageDate, setPageDate] = useState(today.clone().startOf("month").startOf("week"));

    useEffect(() => {
        setIsNarrowWindow(!isWidth800);
    }, [isWidth800]);

    useEffect(() => {

        let tmpCounts = [];
        for (let i = 0; i < 35; i++) {
            let dt = pageDate.clone().add(i, "days");
            let count = dateList.reduce((acc, cur) => {
                let diff = dt.diff(moment(cur * 1000), "days");
                return acc + (diff >= 0 && diff < 180 ? 1 : 0);
            }, 0);
            tmpCounts.push(count);
        }
        setDayCounts([...tmpCounts]);

    }, [pageDate, dateList]);

    useEffect(() => {
        if (!user) {
            return;
        }

        if (!doneInitialFetch) {
            firebase.database().ref().child("users").child(user.uid).get().then((snapshot) => {
                if (snapshot.exists()) {
                    setDateList(snapshot.val());
                }
            }).catch((error) => {
                console.error(error);
            });
            setDoneInitialFetch(true);
        } else {
            firebase.database().ref('users/' + user.uid).set(dateList);
        }
    }, [user, dateList]);

    const onClickDay = (day) => {
    }

    const onMouseDown = (day, buttons) => {

        if (buttons === 1) {

            debounceWindow.current = true;
            if (debounceTimer.current != null) {
                clearTimeout(debounceTimer.current);
                debounceTimer.current = null;
            }

            debounceTimer.current = setTimeout(() => {
                debounceWindow.current = false;
                debounceTimer.current = null;
            }, 500);

            let dateKey = day.unix();
            if (dateList.indexOf(dateKey) < 0) {
                dateList.push(dateKey);
                setDateList([...dateList.sort()]);
            } else {
                setDateList([...dateList.filter(x => x !== dateKey)]);
            }

        }

    }

    const onMouseMove = (day, buttons) => {

        if (debounceWindow.current) {
            return;
        }

        if (buttons === 1) {
            let dateKey = day.unix();
            if (dateList.indexOf(dateKey) < 0) {
                dateList.push(dateKey);
                setDateList([...dateList.sort()]);
            }

        }

    }

    const onMouseUp = (day, buttons) => {
        if (buttons === 0) {
        }
    }

    const onNavigatePrev = () => {
        let nextDate = currentDate.clone().subtract(1, "month");
        setCurrentDate(nextDate);
        setPageDate(nextDate.clone().startOf("month").startOf("week"));
    }

    const onNavigateToday = () => {
        setCurrentDate(today.clone());
        setPageDate(today.clone().startOf("month").startOf("week"));
    }

    const onNavigateNext = () => {
        let nextDate = currentDate.clone().add(1, "month");
        setCurrentDate(nextDate);
        setPageDate(nextDate.clone().startOf("month").startOf("week"));
    }

    const onNavigateClear = () => {
        setDateList([]);
    }

    const renderCalendar = () => {

        let weeks = [];
        for (let i = 0; i < 5; i++) {
            let week = [];
            for (let j = 0; j < 7; j++) {
                week.push(pageDate.clone().add(i * 7 + j, "days"));
            }
            weeks.push(week);
        }

        return weeks.map((week, ix) => {
            return (<div className={styles.week} key={ix}>
                { week.map((day, iy) => {
                    let dayStyleList = [styles.day];
                    let dayNum = ix * 7 + iy;
                    let count = dayCount[dayNum];
                    if (count > 90) {
                        dayStyleList.push(styles.overstay)
                    } else {
                        dayStyleList.push(styles.understay)
                    }

                    let bodyStyleList = [];
                    if (dateList.indexOf(day.unix()) >= 0) {
                        bodyStyleList.push(styles.inEU);
                    }

                    let dayNumStyleList = [styles.dayNum];
                    if (day.isSame(today)) {
                        dayNumStyleList.push(styles.today);
                    }

                    return (<div className={dayStyleList.join(" ")} key={iy} onClick={() => onClickDay(day)} onMouseMove={(ev) => onMouseMove(day, ev.buttons, ev)} onMouseDown={(ev) => onMouseDown(day, ev.buttons)} onMouseUp={(ev) => onMouseUp(day, ev.buttons)}>
                        <div className={bodyStyleList.join(" ")}></div>
                        <div className={styles.dayHeader}>
                            <div className={dayNumStyleList.join(" ")}><span>{day.format("D")}</span></div>
                        </div>
                        <div className={styles.dayBody}>
                            <div className={styles.daysText}>{count > 0 ? count : ""}</div>
                        </div>
                    </div>)
                })}
            </div>)
        });

    }

    const renderDayHeaders = () => {

        let dt = moment().startOf("week");
        let days = [];
        for (let i = 0; i < 7; i++) {
            days.push(dt.format("ddd"));
            dt.add(1, "days");
        }

        return days.map((d, ix) => (<div className={styles.dayName} key={ix}>{d}</div>));

    }

    return <div className={styles.calendar}>
        <div className={styles.toolbar}>
            <div className={styles.buttonBarNav}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ArrowBack></ArrowBack>}
                    onClick={onNavigatePrev}
                >Back</Button>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CalendarToday></CalendarToday>}
                    onClick={onNavigateToday}
                >Today</Button>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ArrowForward></ArrowForward>}
                    onClick={onNavigateNext}
                >Next</Button>
            </div>
            <div className={styles.buttonBarNav2}>
                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<Delete></Delete>}
                    onClick={onNavigateClear}
                >Clear All</Button>
                <div className={styles.currentDateDisplay}>
                    {currentDate.format("MMMM YYYY")}
                </div>
            </div>
        </div>
        <div>

        </div>
        <div className={styles.calendarHeader}>
            {renderDayHeaders()}
        </div>
        <div className={styles.calendarBody}>
            {renderCalendar()}
        </div>
    </div>

}