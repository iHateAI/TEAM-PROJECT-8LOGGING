const ApiError = require("../utils/ApiError");
const dateToString = require("../utils/dateToString");
const { sendEmail } = require("../utils/EmailDelivery");

// 모델 불러오기
const { User, Channel, WaitList } = require("../models");

module.exports = {
  /**
   * 새로운 채널 생성
   *
   * @param {String} title
   * @param {String} userId
   * @param {String} locationDist
   * @param {String} locationCity
   * @param {Number} memberNum
   * @param {String} spec
   * @param {String} location
   * @returns
   */
  async createChannel(
    title,
    userId,
    locationDist,
    locationCity,
    memberNum,
    spec,
    location
  ) {
    // 중복된 제목 체크
    const exChannel = await Channel.findOne({ title });
    if (exChannel) {
      throw ApiError.badRequest("이미 존재하는 채널명입니다.");
    }

    // 채널 생성
    const channel = await Channel.create({
      title,
      ownerId: userId,
      locationDist,
      locationCity,
      memberNum,
      spec,
      img: location,
      members: [userId],
      status: 0,
    });

    // WaitList 생성
    const waitList = await WaitList.create({
      channelId: channel._id,
      ownerId: userId,
    });

    // 생성한 user의 channels, waitResList 정보 update
    const user = await User.findOne({ _id: userId });
    const updatedUser = await User.findByIdAndUpdate(userId, {
      channels: [...user.channels, channel._id],
      waitResList: [...user.waitReqList, waitList._id],
    });

    return channel._id;
  },

  /**
   * 모집 중인 채널 목록 반환
   *
   * @returns
   */
  // async getRecruitChannels() {
  //   const channels = await Channel.find({status: 0});

  //   const recruitChannels = await Promise.all(channels.map( async (channel) => {
  //     // ownerId에 해당되는 nickname 찾기용
  //     const user = await User.findById(channel.ownerId)

  //     return {
  //       _id: channel._id,
  //       title: channel.title,
  //       imgUrl: channel.img,
  //       locationDist: channel.locationDist,
  //       locationCity: channel.locationCity,
  //       memberNum: channel.memberNum,
  //       curMemberNum: channel.members.length,
  //       ownerNickname: user.nickname
  //     }
  //   }));

  //   return recruitChannels
  // },

  async getChannelList(page, status) {
    const perPage = 9; // 페이지당 9개씩 보여주기
    const allChannelsCount = await Channel.find({}).count();
    const totalPages = Math.floor(allChannelsCount / perPage + 1);

    const channels = await Channel.find({ status })
      .sort({ _id: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean();
    const channelItems = channels.map((channel) => {
      channel.createdAt = dateToString(channel.createdAt);
      return channel;
    });
    return {
      channelItems,
      totalPages,
    };
  },

  /**
   * 채널 정보 확인
   *
   * @param {String} channelId
   */
  async getChannelInfo(channelId) {
    const channel = await Channel.findById(channelId);
    const owner = await User.findById(channel.ownerId);

    // 멤버들 정보 불어오기
    const membersInfo = await Promise.all(
      channel.members.map(async (memberId) => {
        const member = await User.findById(memberId);
        return {
          memberId,
          memberNickname: member.nickname,
          memberPic: member.profPic,
        };
      })
    );

    // 채널 정보 모으기
    const channelInfo = {
      _id: channel._id,
      title: channel.title,
      ownerInfo: {
        ownerId: channel.ownerId,
        ownerNickname: owner.nickname,
        ownerPic: owner.profPic,
      },
      locationDist: channel.locationDist,
      locationCity: channel.locationCity,
      imgUrl: channel.img,
      spec: channel.spec,
      memberNum: channel.memberNum,
      membersInfo,
    };

    return channelInfo;
  },

  /**
   * 채널 상태 변경
   *
   * @param {String} userId
   * @param {String} channelId
   * @param {Number} newStatus
   * @returns
   */
  async updateChannelInfo(userId, channelId, toUpdate) {
    // 채널 소유권 확인
    const channel = await Channel.findById(channelId);
    if (channel.ownerId != userId) {
      throw ApiError.badRequest("채널의 수정 권한이 없습니다.");
    }

    // 채널 정보 수정
    const { title, status, spec, locationDist, locationCity, img } = toUpdate;

    const newValues = {
      ...(title && { title }),
      ...(status && { status }),
      ...(spec && { spec }),
      ...(locationDist && { locationDist }),
      ...(locationCity && { locationCity }),
      ...(img && { img }),
    };

    const updatedChannel = await Channel.findByIdAndUpdate(
      channelId,
      newValues
    );

    return updatedChannel._id;
  },

  /**
   * 채널 입장 신청
   * 
   * @param {String} userId 
   * @param {String} channelId 
   */
  async requestEnter(userId, channelId) {
    // 채널 소유권 확인
    const channel = await Channel.findById(channelId);
    if (channel.ownerId == userId) {
      throw ApiError.badRequest("본인이 개설한 채널에 가입할 수 없습니다.");
    }

    // waitList 수정
    const waitList = await WaitList.findOne({ channelId });
    if (waitList.waiting.includes(userId)) {
      throw ApiError.badRequest("이미 가입 신청한 채널입니다.");
    }
    await WaitList.findOneAndUpdate(
      { channelId },
      {
        waiting: [...waitList.waiting, userId],
      }
    );

    // user channels, waitReqList 수정
    const user = await User.findById(userId);
    await User.findByIdAndUpdate(userId, {
      waitReqList: [...user.waitReqList, waitList._id],
      channels: [...user.channels, channelId]
    });

    // 이메일 전송
    const owner = await User.findById(channel.ownerId);

    const from = '"8LOGGING" <wnsdml0120@gmail.com>';
    const to = owner.email;
    const subject = "8LOGGING 채널 입장 신청이 들어왔습니다!";
    const text = `${user.nickname} 님께서 회원님의 채널 [ ${channel.title} ]에 입장 신청하였습니다. 입장을 수락 혹은 거절해주세요!`;
    const html = `<b>${user.nickname}</b>님께서 회원님의 채널 <b>[ ${channel.title} ]</b>에 입장 신청하였습니다.<br/><br/>입장을 수락 혹은 거절해주세요!`;
    await sendEmail(from, to, subject, text, html);
  },

  /**
   * 채널 입장 신청 취소
   * 
   * @param {String} userId 
   * @param {String} channelId 
   */
  async cancelEnter(userId, channelId) {
    // waitList 수정
    const waitList = await WaitList.findOne({ channelId });
    if (!waitList.waiting.includes(userId)) {
      throw ApiError.badRequest("가입 신청한 적이 없는 채널입니다.")
    }
    await WaitList.findOneAndUpdate( { channelId }, {
      waiting: waitList.waiting.filter( id => id!=userId )
    });

    // user channels, waitReqList 수정
    const user = await User.findById(userId);
    const newWaitReqList = user.waitReqList.filter( id => id.str!==waitList._id.str );
    const newChannels = user.channels.filter( id => id.str!=channelId.str ); 
    await User.findByIdAndUpdate(userId, { 
      waitReqList: newWaitReqList,
      channels: newChannels
    });

    // 이메일 전송
    const channel = await Channel.findById(channelId);
    const owner = await User.findById(channel.ownerId);

    const from = '"8LOGGING" <wnsdml0120@gmail.com>';
    const to = owner.email;
    const subject = "8LOGGING 채널 입장 신청이 취소되었습니다!";
    const text = `${user.nickname} 님께서 회원님의 채널 [ ${channel.title} ] 입장 신청을 취소하였습니다.`;
    const html = `<b>${user.nickname}</b>님께서 회원님의 채널 <b>[ ${channel.title} ]</b> 입장 신청을 취소하였습니다.`;
    await sendEmail(from, to, subject, text, html);

  },

  /**
   * 채널 입장 신청 목록 확인
   * 
   * @param {String} userId 
   * @param {String} channelId 
   * @returns 
   */
  async getWaitList(userId, channelId) {
    // 권한 확인
    const channel = await Channel.findById(channelId);
    if (channel.ownerId!==userId) {
      throw ApiError.badRequest("조회 권한이 없습니다.")
    }

    // waitList 조회
    const rawWaitList = await WaitList.findOne({ channelId });
    
    // waitList에 있는 user 정보들 반환
    const waitList = await Promise.all(rawWaitList.waiting.map( async (id) => {
      const user = await User.findById(id);
      return { userId, nickname: user.nickname, profPic: user.profPic }
    }))

    return waitList
  },

  /**
   * 채널 입장 수락
   * 
   * @param {String} userId 
   * @param {String} channelId 
   * @param {String} waitingId 
   */
  async acceptEnter(userId, channelId, waitingId) {
    // 권한 확인
    const channel = await Channel.findById(channelId);
    if (channel.ownerId!==userId) {
      throw ApiError.badRequest("수락 권한이 없습니다.")
    }

    // waitList 수정
    const waitList = await WaitList.findOne({ channelId });
    await WaitList.findOneAndUpdate( { channelId }, {
      waiting: waitList.waiting.filter( id => id!=waitingId )
    });

    // channel member 수정하기
    const newMembers = [ ...channel.members, waitingId ]
    await Channel.findByIdAndUpdate(channelId, { members: newMembers })

    // waiting user channels, waitReqList 수정
    const user = await User.findById(waitingId);
    const newWaitReqList  = user.waitReqList.filter( id => id.str!==waitList._id.str );
    const newChannels = [ ...user.channels, channelId ];
    await User.findByIdAndUpdate(userId, { waitReqList: newWaitReqList, channels: newChannels });

    // 이메일 전송
    const owner = await User.findById(channel.ownerId);
    const from = '"8LOGGING" <wnsdml0120@gmail.com>';
    const to = user.email;
    const subject = "8LOGGING 채널 입장 신청이 수락되었습니다!";
    const text = `${owner.nickname} 님께서 채널 [ ${channel.title} ] 입장 신청을 수락하였습니다. 즐거운 플로깅하세요!`;
    const html = `<b>${owner.nickname}</b>님께서 채널 <b>[ ${channel.title} ]</b> 입장 신청을 수락하였습니다.<br/><br/> 즐거운 플로깅하세요!`;
    await sendEmail(from, to, subject, text, html);

  },

};
