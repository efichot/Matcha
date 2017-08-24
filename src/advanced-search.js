import { log } from 'console';
import _ from 'lodash';
import mongoConnectAsync from './mongo';
import {  getAge, sortUsersByDistance, getDistance } from './lib';

const listAllInterests = (allUsers, me) => {
    const allInterests = [];

    for (i = 0; i < me.interests.length; i++) {
        allInterests.push(me.interests[i]);
    }
    for (i=0; i<allUsers.length; i++) {
        if (allInterests.indexOf(allUsers.interests[i]) === -1) {
            allInterests.push(allUsers.interests[i]);
        }
    }
    return allInterests.sort();
}

const sortByPopularity = (allUsers) => {
    for (i = 0; i < allUsers.length; i++) {
        for (j = i + 1; j < allUsers.length; j++) {
            if (parseInt(allUsers[i].popularity, 10) > parseInt(allUsers[j].popularity, 10)) {
                const tmp = allUsers[i];
                allUsers[i] = allUsers[j];
                allUsers[j] = tmp;
            }
        }
    }
    return (allUsers);
}

const sortUsersByAge = (allUsers) => {
    const ret = allUsers;
    for (i = 0; i < allUsers.length; i++) {
        for (j = i + 1; j < allUsers.length; j++) {
            if (parseInt(allUsers[i].age, 10) > parseInt(allUsers[j].age, 10)) {
                const tmp = allUsers[i];
                allUsers[i] = allUsers[j];
                allUsers[j] = tmp;
            }
        }
    }
    return (allUsers);
}

const renderPage = (req, res, next) => {
    const { username } = req.session;

    mongoConnectAsync(res, async (Users) => {
        const user = await findOne({ 'account.username': username });

        if (!user) {
            log('Error: User not found, redirect to login page.');
            res.redirect('/');
        } else {
            let allUsers = [];
            const me = user;
            const reports = user.reports || [];
            const myLongitude = user.location && user.location.longitude ? user.location.longitude : 0;
            const myLatitude = user.location && user.location.latitude ? user.location.latitude : 0;

            Users.find({}).each((err, user) => {
                if (user !== null) {
                    if (user.account.username !== req.session.username && reports.indexOf(user.account.username) === -1) {
                        user.age = getAge(user.info.birthdate);
                        user.distance = user.location ? getDitance(myLatitude, myLongitude, user.location.latitude, user.location.longitude) : 9999;
                        user.firstname = user.infos.firstname;
                        user.sex = user.infos.sex ? user.infos.sex : 'Other';
                        user.city = user.location ? user.location.city : 'Not defined';
                        user.orientation = user.infos.orientation ? user.infos.orientation : 'Bisexual';
                        user.photo = user.photo && user.photos.profile ? user.photo.profile : 'http://fakeimg.pl/200x200/';
                        user.popularity = user.popularity ? user.popularity : 50;
                        allUsers.push(user);
                    } else {
                        res.render('search', {
                            isNotHome: true,
                            navSearch: true,
                            title: 'Matcha - Advanced Search',
                            bodyPage: 'profile-around',
                            login: _.capitalize(req.session.firstname),
                            byDistance: sortUsersByDistance(allUsers),
                            byAge: sortUsersByAge(allUsers),
                            byPopularity: sortUsersByPopularity(allUsers),
                            interests: listAllInterests(allUsers, me),
                        })
                    }
            }

export default {
    renderPage,
}