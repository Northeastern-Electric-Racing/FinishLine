"use strict";
/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.dbSeedAllUsers = void 0;
var client_1 = require("@prisma/client");
var prisma_1 = require("../prisma");
var user_query_args_1 = require("../../prisma-query-args/user.query-args");
/** Gets the current content of the .env file */
var currentEnv = require('dotenv').config().parsed;
var thomasEmrax = {
    firstName: 'Thomas',
    lastName: 'Emrax',
    googleAuthId: '1',
    email: 'emrax.t@husky.neu.edu',
    emailId: 'emrax.t',
    userSettings: {
        create: {
            defaultTheme: client_1.Theme.DARK,
            slackId: currentEnv && currentEnv.SLACK_ID ? currentEnv.SLACK_ID : 'emrax'
        }
    },
    userSecureSettings: {
        create: {
            phoneNumber: '1234567890',
            nuid: '12345678',
            city: 'Boston',
            state: 'MA',
            street: '1234 Street',
            zipcode: '12345'
        }
    }
};
var joeShmoe = {
    firstName: 'Joe',
    lastName: 'Shmoe',
    googleAuthId: '2',
    email: 'shmoe.j@husky.neu.edu',
    emailId: 'shmoe.j',
    userSettings: {
        create: {
            defaultTheme: client_1.Theme.LIGHT,
            slackId: 'asdf'
        }
    }
};
var joeBlow = {
    firstName: 'Joe',
    lastName: 'Blow',
    googleAuthId: '3',
    email: 'blow.j@husky.neu.edu',
    emailId: 'blow.j',
    userSettings: {
        create: {
            defaultTheme: client_1.Theme.DARK,
            slackId: 'blow'
        }
    }
};
var wonderwoman = {
    firstName: 'Diana',
    lastName: 'Prince',
    email: 'wonderwoman@justiceleague.com',
    emailId: 'wonderwoman',
    googleAuthId: 'wonderwoman'
};
var lexLuther = {
    firstName: 'Alexander',
    lastName: 'Luther',
    email: 'lexluther@justiceleague.com',
    googleAuthId: 'hjkklo'
};
var hawkgirl = {
    firstName: 'Shiera',
    lastName: 'Hall',
    email: 'hawkgirl@justiceleague.com',
    googleAuthId: 'bhuujki'
};
var elongatedMan = {
    firstName: 'Randolph',
    lastName: 'Dibney',
    email: 'elongatedmangit @justiceleague.com',
    googleAuthId: 'joigiug'
};
var zatanna = {
    firstName: 'Zatanna',
    lastName: 'Zatara',
    email: 'zatanna@justiceleague.com',
    googleAuthId: 'cawwww'
};
var phantomStranger = {
    firstName: 'Judas',
    lastName: 'Iscariot',
    email: 'phantomstranger@justiceleague.com',
    googleAuthId: 'bnhjiuy'
};
var redTornado = {
    firstName: 'Red',
    lastName: 'Tornado',
    email: 'redtornado@justiceleague.com',
    googleAuthId: 'vbnhught'
};
var firestorm = {
    firstName: 'Ronnie',
    lastName: 'Raymond',
    email: 'firestorm@justiceleague.com',
    googleAuthId: 'fghttyu'
};
var hankHeywood = {
    firstName: 'Hank',
    lastName: 'Heywood III',
    email: 'hankheywood@justiceleague.com',
    googleAuthId: 'hudhsgf'
};
var flash = {
    firstName: 'Barry',
    lastName: 'Allen',
    googleAuthId: 'flaaaash',
    email: 'flash@starlabs.edu',
    emailId: 'barry.allen'
};
var aquaman = {
    firstName: 'Arthur',
    lastName: 'Curry',
    googleAuthId: 'fish',
    email: 'aquaman@gmail.com',
    emailId: 'thefishman'
};
var robin = {
    firstName: 'Damien',
    lastName: 'Wayne',
    googleAuthId: 'robin',
    email: 'robin4@brucewayne.com'
};
var batman = {
    firstName: 'Bruce',
    lastName: 'Wayne',
    googleAuthId: 'im batman',
    email: 'notbatman@brucewayne.com',
    emailId: 'notbatman',
    userSettings: {
        create: {
            defaultTheme: client_1.Theme.DARK,
            slackId: 'batman'
        }
    }
};
var superman = {
    firstName: 'Clark',
    lastName: 'Kent',
    email: 'superman@thedailyplanet.com',
    googleAuthId: 'superman',
    userSettings: {
        create: {
            defaultTheme: client_1.Theme.LIGHT,
            slackId: 'superman'
        }
    }
};
var cyborg = {
    firstName: 'Vic',
    lastName: 'Stone',
    email: 'cyborg@justiceleague.com',
    googleAuthId: 'beepboop'
};
var martianManhunter = {
    firstName: "J'onn",
    lastName: "J'onnz",
    email: 'martian.manhunter@justiceleague.com',
    googleAuthId: 'martian'
};
var greenLantern = {
    firstName: 'Hal',
    lastName: 'Jordan',
    email: 'greenlantern1@justiceleague.com',
    googleAuthId: 'green'
};
var hawkMan = {
    firstName: 'Hawk',
    lastName: 'Man',
    email: 'hawkman@justiceleague.com',
    googleAuthId: 'cawwwww'
};
var hawkWoman = {
    firstName: 'Hawk',
    lastName: 'Woman',
    email: 'hawkwoman@justiceleague.com',
    googleAuthId: 'cacawwwww'
};
var nightwing = {
    firstName: 'Dick',
    lastName: 'Grayson',
    email: 'robin1@brucewayne.com',
    googleAuthId: 'robin1'
};
var brandonHyde = {
    firstName: 'Brandon',
    lastName: 'Hyde',
    email: 'brandon.hyde@orioles.com',
    googleAuthId: 'letsgoOs'
};
var calRipken = {
    firstName: 'Cal',
    lastName: 'Ripken',
    email: 'cal.ripken@orioles.com',
    googleAuthId: 'ooooos'
};
var adleyRutschman = {
    firstName: 'Adley',
    lastName: 'Rutschman',
    email: 'adley.rutschman@orioles.com',
    googleAuthId: 'catchin'
};
var johnHarbaugh = {
    firstName: 'John',
    lastName: 'Harbaugh',
    email: 'john.harbaugh@ravens.com',
    googleAuthId: 'hcjh'
};
var lamarJackson = {
    firstName: 'Lamar',
    lastName: 'Jackson',
    email: 'lamar.jackson@ravens.com',
    googleAuthId: 'lj8'
};
var nezamJazayeri = {
    firstName: 'Nezam',
    lastName: 'Jazayeri',
    email: 'nezam.jazayeri@steakman.com',
    googleAuthId: 'strip'
};
var ryanHowe = {
    firstName: 'Ryan',
    lastName: 'Howe',
    email: 'howeryan@smoothie.com',
    googleAuthId: 'ribeye'
};
var jkDobbins = {
    firstName: 'J.K',
    lastName: 'Dobbins',
    email: 'Dobbins.j.k@ravens.com',
    googleAuthId: 'ravensRB'
};
var davidOjabo = {
    firstName: 'David',
    lastName: 'Ojabo',
    email: 'Ojabo.D@ravens.com',
    googleAuthId: 'ravensOLB'
};
var markAndrews = {
    firstName: 'Mark',
    lastName: 'Andrews',
    email: 'Andrews.MD@ravens.com',
    googleAuthId: 'ravensTE'
};
var odellBeckham = {
    firstName: 'Odell',
    lastName: 'Beckham',
    email: 'Beckham.O@ravens.com',
    googleAuthId: 'ravensWR'
};
var chrisHorton = {
    firstName: 'Chris',
    lastName: 'Horton',
    email: 'Horton.C@ravens.com',
    googleAuthId: 'ravensSTC'
};
var mikeMacdonald = {
    firstName: 'Mike',
    lastName: 'Macdonald',
    email: 'Macdonald.M@ravens.com',
    googleAuthId: 'ravensDC'
};
var toddMonken = {
    firstName: 'Todd',
    lastName: 'Monken',
    email: 'Monken.T@ravens.com',
    googleAuthId: 'ravensOC'
};
var stephenBisciotti = {
    firstName: 'Stephen',
    lastName: 'Bisciotti',
    email: 'Bisciotti.S@ravens.com',
    googleAuthId: 'ravensOwner'
};
var anthonyBernardi = {
    firstName: 'Anthony',
    lastName: 'Bernadi',
    email: 'bernardi.twan@leavingus.com',
    googleAuthId: 'wagyu'
};
var reidChandler = {
    firstName: 'Reid',
    lastName: 'Chandler',
    email: 'rchandler@frontend.com',
    googleAuthId: 'flank'
};
var aang = {
    firstName: 'Aang',
    lastName: 'Airbender',
    googleAuthId: 'aang',
    email: 'aang@avatarBenders.com'
};
var katara = {
    firstName: 'Katara',
    lastName: 'Waterbender',
    googleAuthId: 'katara',
    email: 'katara@avatarBenders.com'
};
var sokka = {
    firstName: 'Sokka',
    lastName: 'Warrior',
    googleAuthId: 'sokka',
    email: 'sokka@avatarBenders.com'
};
var toph = {
    firstName: 'Toph',
    lastName: 'Beifong',
    googleAuthId: 'toph',
    email: 'toph@avatarBenders.com'
};
var zuko = {
    firstName: 'Zuko',
    lastName: 'Firebender',
    googleAuthId: 'zuko',
    email: 'zuko@avatarBenders.com'
};
var iroh = {
    firstName: 'Uncle',
    lastName: 'Iroh',
    googleAuthId: 'iroh',
    email: 'uncleIroh@avatarBenders.com'
};
var azula = {
    firstName: 'Azula',
    lastName: 'Firebender',
    googleAuthId: 'azula',
    email: 'azula@avatarBenders.com'
};
var appa = {
    firstName: 'Appa',
    lastName: 'Skybison',
    googleAuthId: 'appa',
    email: 'appa@avatarBenders.com'
};
var momo = {
    firstName: 'Momo',
    lastName: 'Monkey',
    googleAuthId: 'momo',
    email: 'momo@avatarBenders.com'
};
var suki = {
    firstName: 'Suki',
    lastName: '-',
    googleAuthId: 'suki',
    email: 'suki@avatarBenders.com'
};
var yue = {
    firstName: 'Princess',
    lastName: 'Yue',
    googleAuthId: 'yue',
    email: 'princessYue@avatarBenders.com'
};
var bumi = {
    firstName: 'King',
    lastName: 'Bumi',
    googleAuthId: 'bumi',
    email: 'kingBumi@avatarBenders.com'
};
var cristianoRonaldo = {
    firstName: 'Cristiano',
    lastName: 'Ronaldo',
    email: 'cronaldo@united.com',
    googleAuthId: 'Winger'
};
var thierryHenry = {
    firstName: 'Thierry',
    lastName: 'Henry',
    email: 'thenry@arsenal.com',
    googleAuthId: 'InvincibleStriker'
};
var frankLampard = {
    firstName: 'Frank',
    lastName: 'Lampard',
    email: 'flampard@chelsea.com',
    googleAuthId: 'MidfieldMaestro'
};
var stevenGerrard = {
    firstName: 'Steven',
    lastName: 'Gerrard',
    email: 'sgerrard@liverpool.com',
    googleAuthId: 'RedCaptain'
};
var ryanGiggs = {
    firstName: 'Ryan',
    lastName: 'Giggs',
    email: 'rgiggs@united.com',
    googleAuthId: 'WingWizard'
};
var alanShearer = {
    firstName: 'Alan',
    lastName: 'Shearer',
    email: 'ashearer@blackburn.com',
    googleAuthId: 'GoalMachine'
};
var paulScholes = {
    firstName: 'Paul',
    lastName: 'Scholes',
    email: 'pscholes@united.com',
    googleAuthId: 'PassMaster'
};
var ericCantona = {
    firstName: 'Eric',
    lastName: 'Cantona',
    email: 'ecantona@united.com',
    googleAuthId: 'KingEric'
};
var didierDrogba = {
    firstName: 'Didier',
    lastName: 'Drogba',
    email: 'ddrogba@chelsea.com',
    googleAuthId: 'ClutchStriker'
};
var patrickVieira = {
    firstName: 'Patrick',
    lastName: 'Vieira',
    email: 'pvieira@arsenal.com',
    googleAuthId: 'MidfieldAnchor'
};
var johnTerry = {
    firstName: 'John',
    lastName: 'Terry',
    email: 'jterry@chelsea.com',
    googleAuthId: 'DefensiveRock'
};
var dennisBergkamp = {
    firstName: 'Dennis',
    lastName: 'Bergkamp',
    email: 'dbergkamp@arsenal.com',
    googleAuthId: 'DutchMaster'
};
var brooksRobinson = {
    firstName: 'Brooks',
    lastName: 'Robinson',
    email: 'the.brooksters@orioles.com',
    googleAuthId: 'fries'
};
var jimPalmer = {
    firstName: 'Jim',
    lastName: 'Palmer',
    email: 'jimmy.palms@orioles.com',
    googleAuthId: 'burger'
};
var eddieMurray = {
    firstName: 'Eddie',
    lastName: 'Murray',
    email: 'eddie.murray@orioles.com',
    googleAuthId: 'hotdog'
};
var georgeSisler = {
    firstName: 'George',
    lastName: 'Sisler',
    email: 'g.sisler@orioles.com',
    googleAuthId: 'popcorn'
};
var urbanShocker = {
    firstName: 'Urban',
    lastName: 'Shocker',
    email: 'shock.the.game@orioles.com',
    googleAuthId: 'shocking'
};
var kenWilliams = {
    firstName: 'Ken',
    lastName: 'Williams',
    email: 'justKen@orioles.com',
    googleAuthId: 'kenough'
};
var boogPowell = {
    firstName: 'Boog',
    lastName: 'Powell',
    email: 'boogs@orioles.com',
    googleAuthId: 'soda'
};
var mannyMachado = {
    firstName: 'Manny',
    lastName: 'Machado',
    email: 'machoman@orioles.com',
    googleAuthId: 'macho'
};
var babyDollJacobson = {
    firstName: 'Baby Doll',
    lastName: 'Jacobson',
    email: 'bbydoll@orioles.com',
    googleAuthId: 'babes'
};
var frostBite = {
    firstName: 'Frost',
    lastName: 'Bite',
    googleAuthId: 'husky1',
    email: 'frostbite@northeastern.edu'
};
var winter = {
    firstName: 'Winter',
    lastName: 'Warrior',
    googleAuthId: 'husky2',
    email: 'winterwarrior@northeastern.edu'
};
var paws = {
    firstName: 'Paws',
    lastName: 'The-Dog',
    googleAuthId: 'husky3',
    email: 'paws@northeastern.edu'
};
var snowPaws = {
    firstName: 'Snow',
    lastName: 'Paws',
    googleAuthId: 'husky4',
    email: 'snowpaws@northeastern.edu'
};
var whiteTail = {
    firstName: 'White',
    lastName: 'Tail',
    googleAuthId: 'husky5',
    email: 'whitetail@northeastern.edu'
};
var husky = {
    firstName: 'Husky',
    lastName: 'Dog',
    googleAuthId: 'husky6',
    email: 'huskydog@northeastern.edu'
};
var howler = {
    firstName: 'Howler',
    lastName: 'Husky',
    googleAuthId: 'husky7',
    email: 'howler@northeastern.edu'
};
var snowBite = {
    firstName: 'Snow',
    lastName: 'Bite',
    googleAuthId: 'husky8',
    email: 'SnowBite@northeastern.edu'
};
var zayFlowers = {
    firstName: 'Zay',
    lastName: 'Flowers',
    googleAuthId: '8172979',
    email: 'flowers.za@ravens.com',
    emailId: 'flowers.za'
};
var patrickRicard = {
    firstName: 'Patrick',
    lastName: 'Ricard',
    googleAuthId: '02894828',
    email: 'ricard.pat@ravens.com',
    emailId: 'ricard.pat'
};
var patrickQueen = {
    firstName: 'Patrick',
    lastName: 'Queen',
    googleAuthId: '8681663',
    email: 'queen.pat@ravens.com',
    emailId: 'queen.pat'
};
var jadeveonClowney = {
    firstName: 'Jadeveon',
    lastName: 'Clowney',
    googleAuthId: '9478927',
    email: 'clowney.jadev@ravens.com',
    emailId: 'clowney.jadev'
};
var marlonHumphrey = {
    firstName: 'Marlon',
    lastName: 'Humphrey',
    googleAuthId: '014629n',
    email: 'humphrey.marl@ravens.com',
    emailId: 'humphrey.marl'
};
var kyleHamilton = {
    firstName: 'Kyle',
    lastName: 'Hamilton',
    googleAuthId: '937299j',
    email: 'hamilton.ky@ravens.com',
    emailId: 'hamilton.ky'
};
var marcusWilliams = {
    firstName: 'Marcus',
    lastName: 'Williams',
    googleAuthId: '018383k',
    email: 'williams.marc@ravens.com',
    emailId: 'williams.marc'
};
var roquanSmith = {
    firstName: 'Roquan',
    lastName: 'Smith',
    googleAuthId: '0193739n',
    email: 'smith.roqu@ravens.com',
    emailId: 'smith.roqu'
};
var justinTucker = {
    firstName: 'Justin',
    lastName: 'Tucker',
    googleAuthId: '018392w',
    email: 'tucker.just@ravens.com',
    emailId: 'tucker.just'
};
var monopolyMan = {
    firstName: 'Milburn',
    lastName: 'Pennybags',
    email: 'donotpassgo@northeastern.edu',
    googleAuthId: 'monopoly',
    userSettings: {
        create: {
            defaultTheme: client_1.Theme.LIGHT,
            slackId: 'monopolyman'
        }
    }
};
var mrKrabs = {
    firstName: 'Eugene',
    lastName: 'Krabs',
    email: 'mrkrabs@krustykrabs.com',
    googleAuthId: 'krabs',
    userSettings: {
        create: {
            defaultTheme: client_1.Theme.LIGHT,
            slackId: 'mrkrabs'
        }
    }
};
var richieRich = {
    firstName: 'Richie',
    lastName: 'Rich',
    email: 'richerich@harveycomics.com',
    googleAuthId: 'rich',
    userSettings: {
        create: {
            defaultTheme: client_1.Theme.LIGHT,
            slackId: 'richietherich'
        }
    }
};
var johnBoddy = {
    firstName: 'John',
    lastName: 'Boddy',
    googleAuthId: 'deadmillionaire',
    email: 'johnboddy@clue.com'
};
var villager = {
    firstName: 'Minecraft',
    lastName: 'Villager',
    googleAuthId: 'villager',
    email: 'hrmmm@minecraft.com'
};
var francis = {
    firstName: 'Francis',
    lastName: 'Francis',
    googleAuthId: 'francis',
    email: 'ffrancis@puppyco.com'
};
var victorPerkins = {
    firstName: 'Victor',
    lastName: 'Perkins',
    googleAuthId: 'victorperkins',
    email: 'mysonstolethemoon@evilbank.com'
};
var kingJulian = {
    firstName: 'King',
    lastName: 'Julian',
    googleAuthId: 'kingjulian',
    email: 'iliketomoveit@jungle.net'
};
var regina = {
    firstName: 'Regina',
    lastName: 'George',
    email: 'regina.g@hotmail.com',
    googleAuthId: 'queenBee',
    userSettings: {
        create: {
            defaultTheme: client_1.Theme.DARK,
            slackId: currentEnv && currentEnv.SLACK_ID ? currentEnv.SLACK_ID : 'Queen Regina'
        }
    }
};
var cady = {
    firstName: 'Cady',
    lastName: 'Heron',
    email: 'cadyheron@gmail.com',
    googleAuthId: 'cady'
};
var janis = {
    firstName: 'Janis',
    lastName: 'Ian',
    email: 'ian.ja@gmail.com',
    googleAuthId: 'janis'
};
var damian = {
    firstName: 'Damian',
    lastName: '',
    email: 'hotty@hotmail.com',
    googleAuthId: 'damian'
};
var gretchen = {
    firstName: 'Gretchen',
    lastName: 'Wieners',
    googleAuthId: 'gretch',
    email: 'gretchen.weiners@hotmail.com'
};
var karen = {
    firstName: 'Karen',
    lastName: 'Smith',
    googleAuthId: 'karen',
    email: 'smithkaren@hotmail.com'
};
var aaron = {
    firstName: 'Aaron',
    lastName: 'Samuels',
    googleAuthId: 'aaron',
    email: 'samuels.a@gmail.com'
};
var glen = {
    firstName: 'Glen',
    lastName: 'Coco',
    googleAuthId: 'glen',
    email: 'glen@gmail.com'
};
var shane = {
    firstName: 'Shane',
    lastName: 'Oman',
    googleAuthId: 'shane',
    email: 'shane-oman@hotmail.com'
};
var carr = {
    firstName: 'Coach',
    lastName: 'Carr',
    googleAuthId: 'coach carr',
    email: 'coachcarr@gmail.com'
};
var june = {
    firstName: 'June',
    lastName: 'George',
    googleAuthId: 'june',
    email: 'plasticsurgery@hotmail.com'
};
var norbury = {
    firstName: 'Ms',
    lastName: 'Norbury',
    googleAuthId: 'norbury',
    email: 'norbury@netscape.net'
};
var kevin = {
    firstName: 'Kevin',
    lastName: 'Gnapoor',
    googleAuthId: 'kevin',
    email: 'mathclub@gmail.com'
};
var trang = {
    firstName: 'Trang',
    lastName: 'Pak',
    googleAuthId: 'trang',
    email: 'trangPAK@hotmail.com'
};
var spongebob = {
    firstName: 'Spongebob',
    lastName: 'Squarepants',
    googleAuthId: 'spongebob',
    email: 'goofygooober@gmail.com'
};
var patrick = {
    firstName: 'Patrick',
    lastName: 'Star',
    googleAuthId: 'patrick',
    email: 'patrickstar@gmail.com'
};
exports.dbSeedAllUsers = {
    thomasEmrax: thomasEmrax,
    joeShmoe: joeShmoe,
    joeBlow: joeBlow,
    wonderwoman: wonderwoman,
    flash: flash,
    aquaman: aquaman,
    lexLuther: lexLuther,
    hawkgirl: hawkgirl,
    elongatedMan: elongatedMan,
    zatanna: zatanna,
    phantomStranger: phantomStranger,
    redTornado: redTornado,
    firestorm: firestorm,
    hankHeywood: hankHeywood,
    robin: robin,
    batman: batman,
    superman: superman,
    hawkMan: hawkMan,
    hawkWoman: hawkWoman,
    cyborg: cyborg,
    greenLantern: greenLantern,
    martianManhunter: martianManhunter,
    nightwing: nightwing,
    aang: aang,
    katara: katara,
    sokka: sokka,
    toph: toph,
    zuko: zuko,
    iroh: iroh,
    azula: azula,
    appa: appa,
    momo: momo,
    suki: suki,
    yue: yue,
    bumi: bumi,
    brandonHyde: brandonHyde,
    calRipken: calRipken,
    adleyRutschman: adleyRutschman,
    johnHarbaugh: johnHarbaugh,
    lamarJackson: lamarJackson,
    nezamJazayeri: nezamJazayeri,
    ryanHowe: ryanHowe,
    anthonyBernardi: anthonyBernardi,
    reidChandler: reidChandler,
    cristianoRonaldo: cristianoRonaldo,
    thierryHenry: thierryHenry,
    frankLampard: frankLampard,
    stevenGerrard: stevenGerrard,
    ryanGiggs: ryanGiggs,
    paulScholes: paulScholes,
    alanShearer: alanShearer,
    ericCantona: ericCantona,
    patrickVieira: patrickVieira,
    didierDrogba: didierDrogba,
    johnTerry: johnTerry,
    dennisBergkamp: dennisBergkamp,
    jkDobbins: jkDobbins,
    davidOjabo: davidOjabo,
    markAndrews: markAndrews,
    odellBeckham: odellBeckham,
    chrisHorton: chrisHorton,
    mikeMacdonald: mikeMacdonald,
    toddMonken: toddMonken,
    stephenBisciotti: stephenBisciotti,
    brooksRobinson: brooksRobinson,
    jimPalmer: jimPalmer,
    eddieMurray: eddieMurray,
    georgeSisler: georgeSisler,
    urbanShocker: urbanShocker,
    kenWilliams: kenWilliams,
    boogPowell: boogPowell,
    mannyMachado: mannyMachado,
    babyDollJacobson: babyDollJacobson,
    frostBite: frostBite,
    winter: winter,
    snowPaws: snowPaws,
    paws: paws,
    whiteTail: whiteTail,
    husky: husky,
    howler: howler,
    snowBite: snowBite,
    zayFlowers: zayFlowers,
    patrickRicard: patrickRicard,
    patrickQueen: patrickQueen,
    jadeveonClowney: jadeveonClowney,
    marlonHumphrey: marlonHumphrey,
    kyleHamilton: kyleHamilton,
    marcusWilliams: marcusWilliams,
    roquanSmith: roquanSmith,
    justinTucker: justinTucker,
    monopolyMan: monopolyMan,
    mrKrabs: mrKrabs,
    richieRich: richieRich,
    johnBoddy: johnBoddy,
    villager: villager,
    francis: francis,
    victorPerkins: victorPerkins,
    kingJulian: kingJulian,
    regina: regina,
    gretchen: gretchen,
    karen: karen,
    janis: janis,
    aaron: aaron,
    cady: cady,
    damian: damian,
    glen: glen,
    shane: shane,
    june: june,
    kevin: kevin,
    norbury: norbury,
    carr: carr,
    trang: trang,
    spongebob: spongebob,
    patrick: patrick
};
var createUser = function (user, role, organizationId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.user.create(__assign({ data: __assign(__assign({}, user), { organizations: {
                            connect: {
                                organizationId: organizationId
                            }
                        }, roles: {
                            create: {
                                roleType: role,
                                organizationId: organizationId
                            }
                        } }) }, (0, user_query_args_1.getUserQueryArgs)(organizationId)))];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.createUser = createUser;
